"use client";

import { useState, useEffect, useRef, useCallback } from 'react';
import { entryPlaceApiHeaders, withIdentifierQuery } from '../api/credentials';

interface Ad {
  id: number;
  image_url: string | null;
  url: string | null;
  alt_text: string | null;
  headline: string | null;
  tagline: string | null;
}

interface AdDisplay {
  width: number | null;
  height: number | null;
  show_text: boolean;
}

interface AdResponse {
  handle: string;
  ads: Ad[];
  display: AdDisplay;
  cache_until: string; // ISO8601 datetime
}

interface SponsorAdProps {
  handle: string;
  /**
   * The club's organiser slug. Required and never defaulted: ads are fetched
   * and view/click events are recorded against this org, so a fallback would
   * silently attribute one club's traffic to another.
   */
  org: string;
  className?: string;
}

// Configuration
// Ads come from the same API as everything else unless a host deliberately
// points them somewhere else; no hardcoded host, so a misconfigured site
// fails visibly instead of quietly billing views to another portal.
const AD_API_BASE = process.env.NEXT_PUBLIC_AD_API_BASE || process.env.NEXT_PUBLIC_API_HOST || '';
const VIEW_THRESHOLD_MS = 1000; // Minimum visibility time before counting a view

export default function SponsorAd({ handle, org, className = '' }: SponsorAdProps) {
  const [ads, setAds] = useState<Ad[]>([]);
  const [display, setDisplay] = useState<AdDisplay | null>(null);
  const [currentAdIndex, setCurrentAdIndex] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [viewReported, setViewReported] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);
  const visibilityStartRef = useRef<number | null>(null);
  const hadInteractionRef = useRef(false);
  const isVisibleRef = useRef(false);
  const viewReportedRef = useRef(false); // Synchronous check to prevent race conditions
  const hasFetchedRef = useRef(false); // Prevent double fetch in Strict Mode

  // Fetch ads from API
  useEffect(() => {
    // `org` is typed as required, but a plain-JS consumer can still omit it.
    // Fail closed rather than fetching or reporting against the wrong org.
    if (!org) {
      console.error('SponsorAd: the `org` prop is required (the club organiser slug).');
      setIsLoading(false);
      return;
    }

    // Prevent double fetch in React Strict Mode
    if (hasFetchedRef.current) return;
    hasFetchedRef.current = true;

    const fetchAds = async () => {
      try {
        setIsLoading(true);
        setError(null);

        const url = `${AD_API_BASE}/api/v1/ads/${encodeURIComponent(handle)}?org=${encodeURIComponent(org)}`;
        const response = await fetch(url, { headers: entryPlaceApiHeaders() });

        if (!response.ok) {
          throw new Error(`Failed to fetch ads: ${response.status}`);
        }

        const data: AdResponse = await response.json();
        const adsArray = data.ads || [];

        // Store display settings from API
        setDisplay(data.display);

        // Filter out ads without images
        const validAds = adsArray.filter(ad => ad.image_url);

        // Pick random index before setting ads to avoid flash
        if (validAds.length > 1) {
          setCurrentAdIndex(Math.floor(Math.random() * validAds.length));
        } else if (validAds.length === 1) {
          setCurrentAdIndex(0);
        }
        setAds(validAds);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load ad');
      } finally {
        setIsLoading(false);
      }
    };

    fetchAds();
  }, [handle, org]);

  // Report view event
  const reportView = useCallback(async (ad: Ad, visibilityDurationMs: number) => {
    // Use ref for synchronous check to prevent race conditions
    if (viewReportedRef.current) return;

    // Immediately mark as reported to prevent any concurrent calls
    viewReportedRef.current = true;

    try {
      const today = new Date().toISOString().split('T')[0];

      await fetch(`${AD_API_BASE}/api/v1/ads/events`, {
        method: 'POST',
        headers: {
          ...entryPlaceApiHeaders(),
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          events: [{
            ad_id: ad.id,
            type: 'view',
            date: today,
            count: 1,
          }],
          org,
          signals: {
            visibility_duration_ms: visibilityDurationMs,
            had_interaction: hadInteractionRef.current,
          },
        }),
      });

      setViewReported(true);
    } catch (err) {
      console.error('Error reporting ad view:', err);
      // Reset ref on error so it can retry
      viewReportedRef.current = false;
    }
  }, [org]);

  // Report click event
  const reportClick = useCallback(async (ad: Ad) => {
    try {
      const today = new Date().toISOString().split('T')[0];

      fetch(`${AD_API_BASE}/api/v1/ads/events`, {
        method: 'POST',
        headers: {
          ...entryPlaceApiHeaders(),
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          events: [{
            ad_id: ad.id,
            type: 'click',
            date: today,
            count: 1,
          }],
          org,
          signals: {
            had_interaction: true,
          },
        }),
      });
    } catch (err) {
      console.error('Error reporting ad click:', err);
    }
  }, [org]);

  // Track user interaction (mouse movement, touch, scroll)
  useEffect(() => {
    const handleInteraction = () => {
      hadInteractionRef.current = true;
    };

    window.addEventListener('mousemove', handleInteraction, { once: true });
    window.addEventListener('touchstart', handleInteraction, { once: true });
    window.addEventListener('scroll', handleInteraction, { once: true });

    return () => {
      window.removeEventListener('mousemove', handleInteraction);
      window.removeEventListener('touchstart', handleInteraction);
      window.removeEventListener('scroll', handleInteraction);
    };
  }, []);

  // Check visibility and trigger view when conditions met
  useEffect(() => {
    if (viewReported || ads.length === 0 || currentAdIndex === null) return;

    const currentAd = ads[currentAdIndex];

    const interval = setInterval(() => {
      if (isVisibleRef.current && visibilityStartRef.current) {
        const duration = Date.now() - visibilityStartRef.current;

        // Report view immediately once conditions are met
        if (duration >= VIEW_THRESHOLD_MS && hadInteractionRef.current && !viewReportedRef.current) {
          reportView(currentAd, duration);
        }
      }
    }, 100);

    return () => clearInterval(interval);
  }, [viewReported, ads, currentAdIndex, reportView]);

  // Intersection Observer for visibility tracking
  useEffect(() => {
    if (!containerRef.current || ads.length === 0 || viewReported || currentAdIndex === null) return;

    const currentAd = ads[currentAdIndex];

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            isVisibleRef.current = true;
            if (visibilityStartRef.current === null) {
              visibilityStartRef.current = Date.now();
            }
          } else {
            isVisibleRef.current = false;
            if (visibilityStartRef.current !== null) {
              const duration = Date.now() - visibilityStartRef.current;

              if (duration >= VIEW_THRESHOLD_MS && hadInteractionRef.current) {
                reportView(currentAd, duration);
              }

              visibilityStartRef.current = null;
            }
          }
        });
      },
      {
        threshold: 0.5,
      }
    );

    observer.observe(containerRef.current);

    return () => {
      observer.disconnect();

      if (visibilityStartRef.current !== null && !viewReportedRef.current) {
        const duration = Date.now() - visibilityStartRef.current;
        if (duration >= VIEW_THRESHOLD_MS && hadInteractionRef.current) {
          reportView(currentAd, duration);
        }
      }
    };
  }, [ads, currentAdIndex, reportView]);

  // Handle page unload - report pending view
  useEffect(() => {
    const handleUnload = () => {
      // Use ref for synchronous check
      if (visibilityStartRef.current !== null && !viewReportedRef.current && ads.length > 0 && currentAdIndex !== null) {
        const visibilityDuration = Date.now() - visibilityStartRef.current;
        if (visibilityDuration >= VIEW_THRESHOLD_MS && hadInteractionRef.current) {
          // Mark as reported immediately
          viewReportedRef.current = true;

          const currentAd = ads[currentAdIndex];

          const payload = JSON.stringify({
            events: [{
              ad_id: currentAd.id,
              type: 'view',
              date: new Date().toISOString().split('T')[0],
              count: 1,
            }],
            org,
            signals: {
              visibility_duration_ms: visibilityDuration,
              had_interaction: true,
            },
          });

          navigator.sendBeacon(withIdentifierQuery(`${AD_API_BASE}/api/v1/ads/events`), payload);
        }
      }
    };

    window.addEventListener('beforeunload', handleUnload);
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'hidden') {
        handleUnload();
      }
    });

    return () => {
      window.removeEventListener('beforeunload', handleUnload);
    };
  }, [ads, currentAdIndex, org, viewReported]);

  // Handle click
  const handleClick = () => {
    if (currentAdIndex === null) return;
    const currentAd = ads[currentAdIndex];
    if (currentAd) {
      reportClick(currentAd);
    }
  };

  // Derive dimensions from API display settings
  const adWidth = display?.width ?? 674;
  const adHeight = display?.height ?? 162;
  const showText = display?.show_text ?? false;

  // Container styles for CLS prevention - reserves exact space before image loads
  // For text ads, we don't use aspect ratio since the text content determines height
  const containerStyle: React.CSSProperties = showText
    ? { maxWidth: '400px', margin: '0 auto' }
    : {
        maxWidth: `${adWidth}px`,
        width: '100%',
        aspectRatio: `${adWidth} / ${adHeight}`,
        margin: '0 auto',
      };

  // Loading state - placeholder with reserved space
  if (isLoading) {
    return (
      <div
        ref={containerRef}
        className={className}
        style={{
          ...(showText
            ? { maxWidth: '400px', margin: '0 auto' }
            : { maxWidth: `${adWidth}px`, width: '100%', aspectRatio: `${adWidth} / ${adHeight}`, margin: '0 auto' }),
          backgroundColor: 'rgba(156, 163, 175, 0.1)',
        }}
      />
    );
  }

  // Error, no ads, or index not yet selected - render nothing
  if (error || ads.length === 0 || currentAdIndex === null) {
    return null;
  }

  const currentAd = ads[currentAdIndex];

  // Skip rendering if current ad has no image
  if (!currentAd.image_url) {
    return null;
  }

  // Text + Image layout: flex row with image left, text right
  const textAndImageContent = (
    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
      <div style={{ flexShrink: 0 }}>
        <img
          src={currentAd.image_url}
          alt={currentAd.alt_text || currentAd.headline || 'Sponsor advertisement'}
          width={adWidth}
          height={adHeight}
          style={{ maxWidth: '100%', objectFit: 'contain', display: 'block' }}
          loading="lazy"
        />
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        {currentAd.headline && (
          <div style={{ fontWeight: 'bold', fontSize: 14, lineHeight: 1.3, marginBottom: 4 }}>
            {currentAd.headline}
          </div>
        )}
        {currentAd.tagline && (
          <div style={{ fontSize: 12, lineHeight: 1.4, color: '#666' }}>
            {currentAd.tagline}
          </div>
        )}
      </div>
    </div>
  );

  // Image-only layout
  const imageOnlyContent = (
    <img
      src={currentAd.image_url}
      alt={currentAd.alt_text || currentAd.headline || 'Sponsor advertisement'}
      width={adWidth}
      height={adHeight}
      className="w-full h-full object-cover"
      loading="lazy"
    />
  );

  const adContent = showText ? textAndImageContent : imageOnlyContent;

  return (
    <div
      ref={containerRef}
      className={`sponsor-ad ${className}`}
      style={containerStyle}
    >
      {currentAd.url ? (
        <a
          href={currentAd.url}
          target="_blank"
          rel="noopener noreferrer sponsored"
          onClick={handleClick}
          style={showText ? { display: 'block', textDecoration: 'none', color: 'inherit' } : undefined}
          className={showText ? undefined : "block w-full h-full"}
        >
          {adContent}
        </a>
      ) : (
        adContent
      )}
    </div>
  );
}

import { AxiosResponse } from 'axios';
import axios from './axios';
import { EventResultsResponse } from '../types/results';

export async function getEventResults(eventId: string): Promise<EventResultsResponse> {
    try {
        const response: AxiosResponse<EventResultsResponse> = await axios.get(
            `/api/v1/event/${eventId}/results`
        );
        if (response.status === 200) {
            return response.data;
        }
        throw new Error('Network response was not ok');
    } catch (error: any) {
        if (error.response?.status === 404) {
            throw new Error('ResultsNotFound');
        }
        throw new Error(`${error}`);
    }
}

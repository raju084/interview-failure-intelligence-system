import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { DashboardSummary, Interview, InterviewUpsert } from './models';

@Injectable({ providedIn: 'root' })
export class InterviewService {
  private readonly base = environment.apiUrl;

  constructor(private http: HttpClient) {}

  list(): Observable<Interview[]> {
    return this.http.get<Interview[]>(`${this.base}/interviews`);
  }

  get(id: number): Observable<Interview> {
    return this.http.get<Interview>(`${this.base}/interviews/${id}`);
  }

  create(payload: InterviewUpsert): Observable<Interview> {
    return this.http.post<Interview>(`${this.base}/interviews`, payload);
  }

  update(id: number, payload: InterviewUpsert): Observable<Interview> {
    return this.http.put<Interview>(`${this.base}/interviews/${id}`, payload);
  }

  remove(id: number): Observable<void> {
    return this.http.delete<void>(`${this.base}/interviews/${id}`);
  }

  dashboard(): Observable<DashboardSummary> {
    return this.http.get<DashboardSummary>(`${this.base}/dashboard/summary`);
  }
}

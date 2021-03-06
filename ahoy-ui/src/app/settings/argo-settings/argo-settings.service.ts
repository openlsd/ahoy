/*
 * Copyright  2021 LSD Information Technology (Pty) Ltd
 *
 *    Licensed under the Apache License, Version 2.0 (the "License");
 *    you may not use this file except in compliance with the License.
 *    You may obtain a copy of the License at
 *
 *        http://www.apache.org/licenses/LICENSE-2.0
 *
 *    Unless required by applicable law or agreed to in writing, software
 *    distributed under the License is distributed on an "AS IS" BASIS,
 *    WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *    See the License for the specific language governing permissions and
 *    limitations under the License.
 */

import {Injectable} from '@angular/core';
import {LoggerService} from '../../util/logger.service';
import {RestClientService} from '../../util/rest-client.service';
import {EMPTY, Observable} from 'rxjs';
import {catchError, tap} from 'rxjs/operators';
import {ArgoSettings} from './argo-settings';
import {Notification} from '../../notifications/notification';
import {NotificationsService} from '../../notifications/notifications.service';

@Injectable({
  providedIn: 'root'
})
export class ArgoSettingsService {

  constructor(
    private log: LoggerService,
    private restClient: RestClientService,
    private notificationsService: NotificationsService) {
  }

  get(): Observable<ArgoSettings> {
    const url = `/data/argoSettings/1`;
    return this.restClient.get<ArgoSettings>(url, false, () => {
      return new ArgoSettings(1);
    }).pipe(
      tap((settings) => {
        this.log.debug('fetched argo settings', settings);
      })
    );
  }

  exists(): Observable<boolean> {
    const url = `/data/argoSettings/1`;
    return this.restClient.exists(url, false).pipe(
      tap((exists) => {
        this.log.debug('checked argo settings exists: ', exists);
      })
    );
  }

  save(argoSettings: ArgoSettings): Observable<ArgoSettings> {
    this.log.debug('saving argo settings: ', argoSettings);

    return this.restClient.post<ArgoSettings>('/data/argoSettings', argoSettings, true).pipe(
      tap((savedSettings) => this.log.debug('saved argo settings', savedSettings))
    );
  }

  testConnection(argoSettings: ArgoSettings): Observable<ArgoSettings> {
    const url = `/data/argoSettings/test`;
    return this.restClient.post<ArgoSettings>(url, argoSettings, true).pipe(
      tap((returnedCluster) => {
        this.log.debug('tested connection to argocd', returnedCluster);
        const text = `Successfully connected to argocd '${argoSettings.argoServer}'`;
        this.notificationsService.notification(new Notification(text));
      }),
      catchError(() => {
        const text = `Failed to connect to argocd ${argoSettings.argoServer}`;
        this.notificationsService.notification(new Notification(text, true));
        return EMPTY;
      })
    );
  }
}

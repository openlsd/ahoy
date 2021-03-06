/*
 * Copyright  2020 LSD Information Technology (Pty) Ltd
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

import {Component, EventEmitter, Input, OnInit} from '@angular/core';
import {MatDialog, MatDialogConfig} from '@angular/material/dialog';
import {MatTableDataSource} from '@angular/material/table';
import {Application, ApplicationEnvironmentConfig, ApplicationVersion} from '../../applications/application';
import {Release, ReleaseVersion} from '../release';
import {AddApplicationDialogComponent} from '../add-application-dialog/add-application-dialog.component';
import {filter} from 'rxjs/operators';
import {EnvironmentRelease} from '../../environment-release/environment-release';
import {ReleasesService} from '../releases.service';
import {ApplicationService} from '../../applications/application.service';
import {Confirmation} from '../../components/confirm-dialog/confirm';
import {DialogService} from '../../components/dialog.service';

@Component({
  selector: 'app-release-application-versions',
  templateUrl: './release-application-versions.component.html',
  styleUrls: ['./release-application-versions.component.scss']
})
export class ReleaseApplicationVersionsComponent implements OnInit {
  @Input() environmentRelease: EnvironmentRelease;
  @Input() releaseVersion: ReleaseVersion;
  @Input() releaseChanged: EventEmitter<{ environmentRelease: EnvironmentRelease, releaseVersion: ReleaseVersion }>;
  private dataSource = new MatTableDataSource<ApplicationVersion>();
  existingConfigs: Map<number, ApplicationEnvironmentConfig>;

  constructor(
    private releasesService: ReleasesService,
    private applicationService: ApplicationService,
    private dialog: MatDialog,
    private dialogService: DialogService) {
  }

  ngOnInit() {
    this.dataSource.data = this.releaseVersion.applicationVersions;
    this.getConfigs();
    this.getStatuses();

    if (this.releaseChanged) {
      this.releaseChanged.subscribe((data) => {
        this.environmentRelease = data.environmentRelease;
        this.releaseVersion = data.releaseVersion;
        this.getReleaseVersion();
      });
    }
  }

  getReleaseVersion() {
    this.releasesService.getVersion(this.releaseVersion.id)
      .subscribe(releaseVersion => {
        this.releaseVersion = releaseVersion;
        this.dataSource.data = this.releaseVersion.applicationVersions;
        this.getConfigs();
        this.getStatuses();
      });
  }

  getConfigs() {
    this.applicationService.getExistingEnvironmentConfigs(this.environmentRelease.id, this.releaseVersion.id)
      .subscribe((configs) => {
        this.existingConfigs = new Map<number, ApplicationEnvironmentConfig>();
        for (const conf of configs) {
          this.existingConfigs.set(conf.id.applicationVersionId, conf);
        }
      });
  }

  getStatuses() {
    this.applicationService.getApplicationReleaseStatus(this.environmentRelease.id, this.releaseVersion.id)
      .subscribe((statuses) => {
        for (const appVersion of this.releaseVersion.applicationVersions) {
          for (const status of statuses) {
            if (status.id.applicationVersionId === appVersion.id) {
              appVersion.status = status;
            }
          }
        }
      });
  }

  public hasConfig(applicationVersionId: number): boolean {
    return this.existingConfigs.has(applicationVersionId);
  }

  addApplication() {
    const dialogConfig = new MatDialogConfig();
    dialogConfig.data = {environmentRelease: this.environmentRelease, releaseVersion: this.releaseVersion};

    const dialogRef = this.dialog.open(AddApplicationDialogComponent, dialogConfig);
    dialogRef.afterClosed().pipe(
      filter((result) => result !== undefined) // cancelled
    ).subscribe((applicationVersion) => {
      this.releasesService.associateApplication(this.releaseVersion.id, applicationVersion.id)
        .subscribe(() => this.getReleaseVersion());
    });
  }

  removeApplication(applicationVersion: ApplicationVersion) {
    const confirmation = new Confirmation(`Are you sure you want to remove ${(applicationVersion.application as Application).name} from ` +
      `${(this.environmentRelease.release as Release).name}?`);
    confirmation.verify = true;
    confirmation.verifyText = (applicationVersion.application as Application).name;
    this.dialogService.showConfirmDialog(confirmation).pipe(
      filter((conf) => conf !== undefined)
    ).subscribe(() => {
      this.releasesService.removeAssociatedApplication(this.releaseVersion.id, applicationVersion.id)
        .subscribe(() => this.getReleaseVersion());
    });
  }

  upgradeApplication(currentAppVersion: ApplicationVersion) {
    const dialogConfig = new MatDialogConfig();
    dialogConfig.data = {
      environmentRelease: this.environmentRelease,
      releaseVersion: this.releaseVersion,
      currentApplicationVersion: currentAppVersion
    };

    const dialogRef = this.dialog.open(AddApplicationDialogComponent, dialogConfig);
    dialogRef.afterClosed().pipe(
      filter((result) => result !== undefined) // cancelled
    ).subscribe((applicationVersion) => {
      this.releasesService.removeAssociatedApplication(this.releaseVersion.id, currentAppVersion.id)
        .subscribe(() => {
          this.releasesService.associateApplication(this.releaseVersion.id, applicationVersion.id)
            .subscribe(() => this.getReleaseVersion());
        });
    });
  }

  hasRoute(applicationVersion: ApplicationVersion): boolean {
    const config = this.existingConfigs.get(applicationVersion.id);
    return !!(config && config.routeHostname);
  }

  getRoute(applicationVersion: ApplicationVersion): string {
    const config = this.existingConfigs.get(applicationVersion.id);
    return `http://${config.routeHostname}`;
  }
}

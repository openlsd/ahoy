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

import {Component, OnInit} from '@angular/core';
import {Environment} from './environment';
import {EnvironmentService} from './environment.service';
import {ActivatedRoute, Router} from '@angular/router';
import {DialogService} from '../components/dialog.service';
import {Cluster} from '../clusters/cluster';
import {LoggerService} from '../util/logger.service';
import {ClusterService} from '../clusters/cluster.service';
import {Confirmation} from '../components/confirm-dialog/confirm';
import {filter} from 'rxjs/operators';

@Component({
  selector: 'app-environments',
  templateUrl: './environments.component.html',
  styleUrls: ['./environments.component.scss']
})
export class EnvironmentsComponent implements OnInit {
  selectedCluster: Cluster;
  environments: Environment[] = undefined;
  clusters: Cluster[] = undefined;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private environmentService: EnvironmentService,
    private clusterService: ClusterService,
    private dialogService: DialogService,
    private log: LoggerService) {
  }

  ngOnInit() {
    const clusterId = +this.route.snapshot.queryParamMap.get('clusterId');

    this.clusterService.getAll()
      .subscribe((clusters) => {
        this.clusters = clusters;

        if (clusterId === 0) {
          this.clusterService.getLastUsedId().subscribe((lastUsedClusterId) => {
            if (lastUsedClusterId !== 0) {
              this.getEnvironments(lastUsedClusterId);
            }
          });
        } else {
          this.getEnvironments(clusterId);
        }
      });
  }

  private getEnvironments(clusterId: number) {
    this.log.debug('getting environments for clusterId=', clusterId);

    this.clusterService.get(clusterId)
      .subscribe(cluster => {
        this.selectedCluster = cluster;
        this.environmentService.getAllEnvironmentsByCluster(clusterId)
          .subscribe(envs => this.environments = envs);
      });
  }

  delete(environment: Environment) {
    const confirmation = new Confirmation(`Are you sure you want to delete ${environment.name}?`);
    confirmation.verify = true;
    confirmation.verifyText = environment.name;
    this.dialogService.showConfirmDialog(confirmation).pipe(
      filter((conf) => conf !== undefined)
    ).subscribe(() => {
      this.environmentService.destroy(environment)
        .subscribe(() => this.getEnvironments(this.selectedCluster.id));
    });
  }

  compareClusters(c1: Cluster, c2: Cluster): boolean {
    if (c1 === null) {
      return c2 === null;
    }

    if (c2 === null) {
      return c1 === null;
    }

    return c1.id === c2.id;
  }

  clusterChanged() {
    this.getEnvironments(this.selectedCluster.id);
  }
}

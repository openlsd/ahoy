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

package za.co.lsd.ahoy.server.environments;

import lombok.extern.slf4j.Slf4j;
import org.springframework.data.rest.webmvc.RepositoryRestController;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RepositoryRestController
@RequestMapping("/environments")
@Slf4j
public class EnvironmentsController {
	private final EnvironmentService environmentService;

	public EnvironmentsController(EnvironmentService environmentService) {
		this.environmentService = environmentService;
	}

	@PostMapping("/create")
	public ResponseEntity<?> create(@RequestBody EnvironmentDTO environmentDTO) {

		Environment newEnvironment = environmentService.create(new Environment(environmentDTO));

		return new ResponseEntity<>(newEnvironment, new HttpHeaders(), HttpStatus.OK);
	}

	@DeleteMapping("/destroy/{environmentId}")
	public ResponseEntity<?> destroy(@PathVariable Long environmentId) {

		Environment environment = environmentService.destroy(environmentId);

		return new ResponseEntity<>(environment, new HttpHeaders(), HttpStatus.OK);
	}

	@PostMapping("/duplicate/{sourceEnvironmentId}/{destEnvironmentId}")
	public ResponseEntity<?> duplicate(@PathVariable Long sourceEnvironmentId, @PathVariable Long destEnvironmentId) {

		Environment destEnvironment = environmentService.duplicate(sourceEnvironmentId, destEnvironmentId);

		return new ResponseEntity<>(destEnvironment, new HttpHeaders(), HttpStatus.OK);
	}
}

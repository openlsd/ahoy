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

package za.co.lsd.ahoy.server.applications;

import org.springframework.data.rest.core.config.Projection;
import za.co.lsd.ahoy.server.docker.DockerRegistry;

import java.util.List;

@Projection(name = "applicationVersion", types = {ApplicationVersion.class})
public interface ApplicationVersionProjection {
	long getId();

	DockerRegistry getDockerRegistry();

	String getImage();

	String getVersion();

	List<Integer> getServicePorts();

	List<ApplicationEnvironmentVariable> getEnvironmentVariables();

	String getHealthEndpointPath();

	Integer getHealthEndpointPort();

	String getHealthEndpointScheme();

	List<ApplicationConfig> getConfigs();

	List<ApplicationVolume> getVolumes();

	List<ApplicationSecret> getSecrets();

	String getConfigPath();

	Application getApplication();
}

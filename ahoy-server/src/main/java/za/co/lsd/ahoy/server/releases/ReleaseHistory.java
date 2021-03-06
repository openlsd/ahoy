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

package za.co.lsd.ahoy.server.releases;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.Type;
import za.co.lsd.ahoy.server.environmentrelease.EnvironmentRelease;

import javax.persistence.*;
import javax.validation.constraints.NotNull;
import java.time.LocalDateTime;

@Entity
@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class ReleaseHistory {
	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Long id;

	@ManyToOne
	private EnvironmentRelease environmentRelease;

	@ManyToOne
	private ReleaseVersion releaseVersion;

	@NotNull
	@Enumerated(EnumType.STRING)
	private ReleaseHistoryAction action;
	@NotNull
	@Enumerated(EnumType.STRING)
	private ReleaseHistoryStatus status;
	@NotNull
	private LocalDateTime time;
	@Lob
	@Type(type = "org.hibernate.type.TextType")
	private String description;

	@Override
	public String toString() {
		return "ReleaseHistory{" +
			"id=" + id +
			", environmentRelease=" + environmentRelease +
			", releaseVersion=" + releaseVersion +
			", action=" + action +
			", status=" + status +
			", time=" + time +
			", description='" + description + '\'' +
			'}';
	}
}

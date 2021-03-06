/*
 * Copyright (C) jdneo

 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * any later version.

 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.

 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */

package com.shengchen.checkstyle.runner.api;

import java.io.File;
import java.util.List;
import java.util.Map;

public interface ICheckerService {

    public void initialize() throws Exception;

    public void dispose() throws Exception;

    public void setConfiguration(Map<String, Object> config) throws Exception;

    public String getVersion() throws Exception;

    public Map<String, List<CheckResult>> checkCode(List<File> filesToCheck, String charset) throws Exception;

}

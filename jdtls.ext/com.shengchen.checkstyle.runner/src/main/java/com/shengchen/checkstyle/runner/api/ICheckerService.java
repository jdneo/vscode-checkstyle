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

import com.puppycrawl.tools.checkstyle.api.CheckstyleException;

import java.io.IOException;
import java.util.List;
import java.util.Map;

public interface ICheckerService {

    public void setConfiguration(Map<String, Object> config) throws IOException, CheckstyleException;

    public Map<String, List<CheckResult>> checkCode(List<String> filesToCheckUris) throws CheckstyleException;

}

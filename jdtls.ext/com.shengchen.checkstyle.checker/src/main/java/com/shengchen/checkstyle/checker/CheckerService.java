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

package com.shengchen.checkstyle.checker;

import com.puppycrawl.tools.checkstyle.Checker;
import com.puppycrawl.tools.checkstyle.ConfigurationLoader;
import com.puppycrawl.tools.checkstyle.Main;
import com.puppycrawl.tools.checkstyle.PropertiesExpander;
import com.puppycrawl.tools.checkstyle.api.CheckstyleException;
import com.shengchen.checkstyle.runner.api.CheckResult;
import com.shengchen.checkstyle.runner.api.ICheckerService;

import java.io.File;
import java.io.IOException;
import java.util.List;
import java.util.Map;
import java.util.Properties;

public class CheckerService implements ICheckerService {

    private Checker checker = null;
    private CheckerListener listener = null;

    public void initialize() {
        checker = new Checker();
        listener = new CheckerListener();
        // reset the basedir if it is set so it won't get into the plugins way
        // of determining workspace resources from checkstyle reported file names, see
        // https://sourceforge.net/tracker/?func=detail&aid=2880044&group_id=80344&atid=559497
        checker.setBasedir(null);
        checker.setModuleClassLoader(Checker.class.getClassLoader());
        checker.addListener(listener);
    }

    public void dispose() {
        if (checker != null) {
            if (listener != null) {
                checker.removeListener(listener);
                listener = null;
            }
            checker.destroy();
            checker = null;
        }
    }

    @SuppressWarnings("unchecked")
    public void setConfiguration(Map<String, Object> config) throws IOException, CheckstyleException {
        final String configurationFsPath = (String) config.get("path");
        final Map<String, String> properties = (Map<String, String>) config.get("properties");
        final Properties checkstyleProperties = new Properties();
        checkstyleProperties.putAll(properties);
        checker.configure(ConfigurationLoader.loadConfiguration(
            configurationFsPath,
            new PropertiesExpander(checkstyleProperties)
        ));
    }

    public String getVersion() throws Exception {
        return Main.class.getPackage().getImplementationVersion();
    }

    public Map<String, List<CheckResult>> checkCode(List<File> filesToCheck, String charset) throws Exception {
        checker.setCharset(charset);
        checker.process(filesToCheck);
        return listener.getResult(filesToCheck);
    }
}

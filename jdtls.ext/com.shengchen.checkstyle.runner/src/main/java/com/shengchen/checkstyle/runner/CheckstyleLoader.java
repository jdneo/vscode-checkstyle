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

package com.shengchen.checkstyle.runner;

import com.shengchen.checkstyle.quickfix.QuickFixService;
import com.shengchen.checkstyle.runner.api.ICheckerService;
import com.shengchen.checkstyle.runner.api.IQuickFixService;

import java.io.File;
import java.lang.reflect.Constructor;
import java.net.URL;
import java.net.URLClassLoader;
import java.nio.file.Paths;

public class CheckstyleLoader {

    static String checkerClass = "com.shengchen.checkstyle.checker.CheckerService";

    URLClassLoader checkerClassLoader = null;

    public ICheckerService loadCheckerService(String checkerJarPath) throws Exception {
        if (checkerClassLoader != null) {
            checkerClassLoader.close();
        }
        checkerClassLoader = new URLClassLoader(new URL[] {
            Paths.get(getServerDir(), "checkstyle").toUri().toURL(),
            Paths.get(checkerJarPath).toUri().toURL()
        }, getClass().getClassLoader());
        final Constructor<?> constructor = checkerClassLoader.loadClass(checkerClass).getConstructor();
        return (ICheckerService) constructor.newInstance();
    }

    public IQuickFixService loadQuickFixService() {
        return new QuickFixService();
    }

    private String getServerDir() throws Exception {
        final File jarFile = new File(getClass().getProtectionDomain().getCodeSource().getLocation().toURI());
        return jarFile.getParentFile().getCanonicalPath();
    }
}

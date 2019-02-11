package com.shengchen.checkstyle.runner;

import org.osgi.framework.BundleActivator;
import org.osgi.framework.BundleContext;

public class CheckstylePlugin implements BundleActivator {

    public static final String PLUGIN_ID = "com.microsoft.java.debug.plugin";
    public static BundleContext context = null;

    @Override
    public void start(BundleContext context) throws Exception {
        CheckstylePlugin.context = context;
    }

    @Override
    public void stop(BundleContext context) throws Exception {
    }

}

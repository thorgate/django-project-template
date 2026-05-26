import React from "react";
import { Helmet } from "react-helmet-async";
import Image from "next/image";

import withView from "@/src/decorators/withView";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import HelloWorld from "@/src/components/HelloWorld";
import logo from "@/src/styles/images/react.svg";

const Home = () => (
    <div className="Home">
        <Helmet>
            <title>Welcome to Razzle</title>
        </Helmet>
        <div className="Home-header">
            <Image src={logo} className="Home-logo" alt="logo" />
            <h2>Welcome to Razzle</h2>
        </div>
        <p className="Home-intro">
            To get started, add routes to{" "}
            <code>src/configuration/routes.js</code> or edit{" "}
            <code>src/views/Home/index.js</code> and save to reload.
        </p>
        <ul className="Home-resources">
            <li>
                <a href="https://github.com/jaredpalmer/razzle">Docs</a>
            </li>
            <li>
                <a href="https://github.com/jaredpalmer/razzle/issues">
                    Issues
                </a>
            </li>
        </ul>
        <ul className="Home-resources mx-auto w-25">
            <LanguageSwitcher />
            <HelloWorld name="TypeScript" />
        </ul>
    </div>
);

export default withView()(Home);

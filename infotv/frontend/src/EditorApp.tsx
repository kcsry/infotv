import React from "react";
import { Config } from "./types";
import TVApp from "./TVApp";
import ShadowPortal from "./ShadowPortal";

export default function EditorApp({ config }: { config: Config }) {
    const setTVRef = (component: TVApp) => {
        window.TV = component;
    };

    return (
        <div id="editor">
            <aside id="editor-aside" />
            <div id="editor-right">
                <div id="editor-top" />
                <main>
                    <ShadowPortal>
                        <TVApp config={config} ref={setTVRef} />
                    </ShadowPortal>
                </main>
            </div>
        </div>
    );
}

import React from "react";
import QS from "query-string";

import TVApp from "./TVApp";
import { Config } from "./types";
import EditorApp from "./EditorApp";
import { createRoot } from "react-dom/client";

const options: Config = {
    deck: "",
    edit: false,
    slow: false,
    event: "",
    ...(window.Options || {}),
    ...(QS.parse(window.location.search) as unknown as Partial<Config>),
};

const setTVRef = (component: TVApp) => {
    window.TV = component;
};

const tvElement = document.getElementById("tv");
if (!tvElement) throw new Error("Missing #tv element");
createRoot(tvElement).render(
    options.edit ? <EditorApp config={options} /> : <TVApp config={options} ref={setTVRef} />,
);

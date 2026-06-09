import React, { useRef, useState, useEffect, ReactNode } from "react";
import { createPortal } from "react-dom";

function adoptStyles(shadowRoot: ShadowRoot) {
    const styles = document.querySelectorAll('link[rel="stylesheet"], style');
    styles.forEach((styleElement) => {
        shadowRoot.appendChild(styleElement.cloneNode(true));
    });
}

/**
 * Renders children inside a Shadow DOM with cloned page styles.
 * Uses CSS zoom to scale content down to the preview container size,
 * so that viewport-relative units (vw/vh/vmax) display correctly
 * even though the preview is smaller than the real viewport.
 */
const ShadowPortal = ({ children }: { children: ReactNode }) => {
    const hostRef = useRef<HTMLDivElement>(null);
    const [container, setContainer] = useState<HTMLElement | null>(null);

    useEffect(() => {
        const hostElement = hostRef.current;
        if (!hostElement) return;
        const shadowRoot = hostElement.attachShadow({ mode: "open" });
        adoptStyles(shadowRoot);
        // Override fixed positioning so that zoom on the container can scale all content.
        // Without this, position:fixed children escape the zoom context because they are
        // positioned relative to the outer containing block, not the shadow container.
        const overrideStyle = document.createElement("style");
        overrideStyle.textContent = "main, #content { position: absolute !important; }";
        shadowRoot.appendChild(overrideStyle);
        const div = document.createElement("div");
        div.style.cssText = "position: relative; overflow: hidden;";
        shadowRoot.appendChild(div);
        setContainer(div);
    }, []); // Create shadow DOM once only

    useEffect(() => {
        if (!container || !hostRef.current) return;
        // Viewport units (vw/vh/vmax) always reference the real window, not the preview
        // box. Apply CSS zoom so that content is scaled down proportionally to the preview.
        const updateZoom = () => {
            const rect = hostRef.current?.getBoundingClientRect();
            if (!rect) return;
            const { width, height } = rect;
            const previewVmax = Math.max(width, height);
            const windowVmax = Math.max(window.innerWidth, window.innerHeight);
            const scale = previewVmax / windowVmax;
            // Set natural (pre-zoom) size so that footprint after zoom = preview size.
            // If natural = preview/scale, then natural * scale = preview. ✓
            container.style.width = `${width / scale}px`;
            container.style.height = `${height / scale}px`;
            (container.style as any).zoom = String(scale);
        };
        updateZoom();
        const observer = new ResizeObserver(updateZoom);
        const hostEl = hostRef.current;
        if (hostEl) observer.observe(hostEl);
        window.addEventListener("resize", updateZoom);
        return () => {
            observer.disconnect();
            window.removeEventListener("resize", updateZoom);
        };
    }, [container]);

    return (
        <div ref={hostRef} style={{ width: "100%", height: "100%" }}>
            {container && createPortal(children, container)}
        </div>
    );
};

export default ShadowPortal;

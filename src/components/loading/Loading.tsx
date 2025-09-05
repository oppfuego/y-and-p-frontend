"use client";

import React from "react";
import "./Loading.scss";

const Loading = () => {
    return (
        <div className="loading-page" role="status" aria-live="polite" aria-busy="true">
            <div className="loader" aria-hidden>
                <span className="loader__ring" />
                <span className="loader__dot" />
            </div>
            <span className="sr-only">Loading…</span>
        </div>
    );
};

export default Loading;

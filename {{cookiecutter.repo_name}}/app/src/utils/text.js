import React from "react";

export const upperCaseFirst = (str) =>
    `${str.charAt(0).toUpperCase()}${str.substr(1).toLowerCase()}`;

export const nl2br = (text) => {
    const res = [];
    text.split("\n").forEach((x, i) => {
        if (i !== 0) {
            res.push(<br key={`br-${i}`} />); // eslint-disable-line react/no-array-index-key
        }

        res.push(x);
    });

    return res;
};

export const tNoop = (key) => key;

import React from 'react';


export default function nl2br(text) {
    const res = [];
    text.split('\n').forEach((x, i) => {
        if (i !== 0) {
            res.push(<br key={`br-${i}`} />);
        }

        res.push(x);
    });

    return res;
}

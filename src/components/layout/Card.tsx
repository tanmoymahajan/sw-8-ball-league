import React from "react";

export function Card({ title, right, children }: { title: string; right?: React.ReactNode; children: React.ReactNode }) {
    return (
        <section className="card">
            <div className="cardHeader">
                <div className="cardTitle">{title}</div>
                {right ? <div className="cardRight">{right}</div> : null}
            </div>
            {children}
        </section>
    );
}

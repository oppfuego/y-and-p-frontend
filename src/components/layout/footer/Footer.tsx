import React from 'react';
import './Footer.scss';

const Footer = () => {

    const year: number = new Date().getFullYear()

    return (
        <footer className="footer" aria-label="Site footer">
            <p className="footer__text">
                &copy; {year} Y&amp;P Agency. All rights reserved.
            </p>
        </footer>
    );
};

export default Footer;
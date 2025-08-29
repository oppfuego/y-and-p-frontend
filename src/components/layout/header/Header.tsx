'use client'

import React, { useEffect, useState } from 'react';
import './Header.scss';
import Link from 'next/link';
import Image from 'next/image';
import Logo from '../../../assets/images/logo.svg';
import { ImWhatsapp } from "react-icons/im";

const Header = () => {
    const [isScrolled, setIsScrolled] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 10);
        };

        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    return (
        <header className={`header ${isScrolled ? "header--small" : ""}`} aria-label="Site header">
            <nav className="header__nav" aria-label="Main navigation">
                <Link href="/" className="header__link" aria-label="Home">
                    <Image src={Logo} alt="Y&P Agency logo" className="header__logo" priority />
                </Link>
                <div className="header__contact-group">
                    <a href="https://wa.me/380738620859" target="_blank" rel="noopener noreferrer" className="header__contact" aria-label="WhatsApp">
                        <span className="header__contact-text">+380 73 862 0859</span>
                        <ImWhatsapp className="header__icon" />
                    </a>
                </div>
            </nav>
        </header>
    );
};

export default Header;
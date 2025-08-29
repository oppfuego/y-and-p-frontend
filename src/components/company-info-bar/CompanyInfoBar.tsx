"use client";

import Link from "next/link";
import Image from "next/image";
import "./CompanyInfoBar.scss";
import BannerImage from "../../assets/images/banner-image.png";

export default function CompanyInfoBar() {
    return (
        <section className="company-info" aria-labelledby="company-info__title">
            <div className="company-info__top">
                <header className="company-info__head" aria-label="Company info header">

                    <h1 id="company-info__title" className="company-info__title">
                        Y&P Agency — Luxury Companionship in Italy
                    </h1>
                    <p className="company-info__lead">
                        The reference point for classy experiences and unforgettable moments in Italy.
                    </p>
                </header>
                <div className="company-info__body">
                    <p className="company-info__text">
                        We offer exclusive encounters with elegant and refined ladies for private dinners, travel,
                        business events, or a true girlfriend experience.
                    </p>
                    <p className="company-info__text">
                        Our mission is discreet, tailored service — connecting clients with women selected for beauty,
                        charm, and professionalism. Whether in Milan or Rome, you’ll find the perfect companion for any
                        occasion.
                    </p>
                </div>
            </div>
            <div className="company-info__middle">
                <nav className="company-info__actions" aria-label="Service cities">
                    <Link href="/city/milan" className="company-info__btn">Milan</Link>
                    <Link href="/city/rome" className="company-info__btn company-info__btn--ghost">Rome</Link>
                </nav>
            </div>

            <div className="company-info__bottom">
                <div className="company-info__body">
                    <p className="company-info__text company-info__text--bottom">
                        At Y&P Agency, we believe that every encounter should be unique: share your desires with us, and
                        we will introduce you to the lady who best embodies them, always ensuring discretion and
                        reliability. Our models offer not only beauty but also personality and charisma, creating an
                        authentic and natural connection.
                    </p>
                    <p className="company-info__text company-info__text--bottom">
                        Available 24/7, our luxury escorts are ready to turn your stay in Italy into a truly special
                        experience. With Y&P Agency, you choose elegance, confidentiality, and pleasure without
                        compromise
                    </p>
                </div>
                <figure className="company-info__media">
                    <Image
                        src={BannerImage}
                        alt="Y&P Agency banner image, elegant evening ambience in Italy"
                        className="company-info__img"
                        priority
                    />
                </figure>
            </div>
        </section>
    );
}

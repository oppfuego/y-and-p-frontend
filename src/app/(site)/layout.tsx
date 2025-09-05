import Header from "@/components/layout/header/Header";
import Footer from "@/components/layout/footer/Footer";
import PageWrapper from "@/components/page-wrapper/PageWrapper";

export default function SiteLayout({children}: { children: React.ReactNode }) {
    return (
        <>
            <Header/>
            <PageWrapper>{children}</PageWrapper>
            <Footer/>
        </>
    );
}

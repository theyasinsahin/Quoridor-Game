import React from "react";

import Navbar from "./Navbar";
import HeroSection from "./HeroSection";
import HowToPlay from "./HowToPlay";
const LandingPage = () => {
    return (
        <>
        <Navbar />
        <HeroSection />
        <HowToPlay />
        {/*<ScreenshotGallery />
        <MultiplayerCTA />
        <Footer />*/}
        </>
    );
}

export default LandingPage;
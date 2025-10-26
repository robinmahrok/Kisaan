import React from "react";
import "./aboutUs.css";
import Header from "../../headerComponent";
import Footer from "../../footerComponent";
import { Container, Card, Row, Col, Badge } from "react-bootstrap";
import { useTranslate } from "../../../hooks/useTranslate";
import SEO from "../SEO";

export default function AboutUs() {
  const { t } = useTranslate();

  const structuredData = {
    "@context": "https://schema.org",
    "@type": "AboutPage",
    name: "About Khetihat",
    description:
      "Learn about Khetihat's mission to connect farmers with buyers and sellers",
    url: "https://khetihat.com/aboutUs",
  };

  return (
    <div className="App-about">
      <SEO
        title="About Us - Khetihat"
        description="Learn about Khetihat's mission to empower farmers and revolutionize the agricultural marketplace. Connecting farmers, buyers and sellers across India."
        keywords="about khetihat, agricultural marketplace, farming platform, farmer empowerment"
        url="/aboutUs"
        structuredData={structuredData}
      />
      <Header />
      <div className="App-header">
        <Container>
          <div className="header-section">
            <h2 className="page-title">{t("About Khetihat")}</h2>
            <Badge variant="success" className="platform-badge">
              {t("Connecting Farmers Nationwide")}
            </Badge>
          </div>

          <div className="about-content">
            {/* Mission Section */}
            <Card className="about-card mission-card">
              <Card.Body>
                <div className="card-icon">🌾</div>
                <h3 className="section-title">{t("Our Mission")}</h3>
                <p className="section-description">
                  {t(
                    "Khetihat is dedicated to revolutionizing agriculture by creating a seamless digital marketplace that connects farmers directly with buyers across India. We believe in empowering farmers with technology to get fair prices for their produce while ensuring buyers get fresh, quality agricultural products."
                  )}
                </p>
              </Card.Body>
            </Card>

            {/* Features Grid */}
            <Row className="features-grid">
              <Col md={6} lg={4} className="feature-col">
                <Card className="feature-card">
                  <Card.Body>
                    <div className="feature-icon">🚀</div>
                    <h4 className="feature-title">{t("Direct Connection")}</h4>
                    <p className="feature-description">
                      {t(
                        "Connect directly with farmers and buyers, eliminating middlemen and ensuring better prices for everyone."
                      )}
                    </p>
                  </Card.Body>
                </Card>
              </Col>

              <Col md={6} lg={4} className="feature-col">
                <Card className="feature-card">
                  <Card.Body>
                    <div className="feature-icon">🌍</div>
                    <h4 className="feature-title">{t("Nationwide Reach")}</h4>
                    <p className="feature-description">
                      {t(
                        "Access markets across India, from Punjab's wheat fields to Kerala's spice gardens."
                      )}
                    </p>
                  </Card.Body>
                </Card>
              </Col>

              <Col md={6} lg={4} className="feature-col">
                <Card className="feature-card">
                  <Card.Body>
                    <div className="feature-icon">💰</div>
                    <h4 className="feature-title">{t("Fair Pricing")}</h4>
                    <p className="feature-description">
                      {t(
                        "Transparent pricing system that ensures farmers get fair value for their hard work."
                      )}
                    </p>
                  </Card.Body>
                </Card>
              </Col>

              <Col md={6} lg={4} className="feature-col">
                <Card className="feature-card">
                  <Card.Body>
                    <div className="feature-icon">📱</div>
                    <h4 className="feature-title">{t("Easy to Use")}</h4>
                    <p className="feature-description">
                      {t(
                        "Simple, intuitive interface designed for farmers and buyers of all technical backgrounds."
                      )}
                    </p>
                  </Card.Body>
                </Card>
              </Col>

              <Col md={6} lg={4} className="feature-col">
                <Card className="feature-card">
                  <Card.Body>
                    <div className="feature-icon">🤝</div>
                    <h4 className="feature-title">{t("24/7 Support")}</h4>
                    <p className="feature-description">
                      {t(
                        "Round-the-clock customer support to help you with any questions or issues."
                      )}
                    </p>
                  </Card.Body>
                </Card>
              </Col>
            </Row>

            {/* Vision Section */}
            <Card className="about-card vision-card">
              <Card.Body>
                <div className="card-icon">🎯</div>
                <h3 className="section-title">{t("Our Vision")}</h3>
                <p className="section-description">
                  {t(
                    "To create a thriving agricultural ecosystem where technology bridges the gap between rural farmers and urban markets, fostering sustainable growth and prosperity for India's farming community. We envision a future where every farmer has access to fair markets and every consumer can trace their food back to its source."
                  )}
                </p>
              </Card.Body>
            </Card>

            {/* Impact Section */}
            <Card className="about-card impact-card">
              <Card.Body>
                <h3 className="section-title">{t("Our Impact")}</h3>
                <Row className="impact-stats">
                  <Col md={3} sm={6} className="stat-col">
                    <div className="stat-number">1000+</div>
                    <div className="stat-label">{t("Farmers Connected")}</div>
                  </Col>
                  <Col md={3} sm={6} className="stat-col">
                    <div className="stat-number">500+</div>
                    <div className="stat-label">{t("Buyers Registered")}</div>
                  </Col>
                  <Col md={3} sm={6} className="stat-col">
                    <div className="stat-number">50+</div>
                    <div className="stat-label">{t("Crop Varieties")}</div>
                  </Col>
                  <Col md={3} sm={6} className="stat-col">
                    <div className="stat-number">25+</div>
                    <div className="stat-label">{t("States Covered")}</div>
                  </Col>
                </Row>
              </Card.Body>
            </Card>

            {/* Team Section */}
            <Card className="about-card team-card">
              <Card.Body>
                <div className="card-icon">👥</div>
                <h3 className="section-title">{t("Our Commitment")}</h3>
                <p className="section-description">
                  {t(
                    "We work tirelessly, day and night, to achieve our goal of transforming Indian agriculture. Our dedicated team is committed to providing the best possible experience for both farmers and buyers. We continuously innovate and improve our platform based on user feedback and changing market needs."
                  )}
                </p>
                <div className="commitment-points">
                  <div className="commitment-point">
                    <span className="point-icon">✓</span>
                    <span>{t("Continuous platform improvement")}</span>
                  </div>
                  <div className="commitment-point">
                    <span className="point-icon">✓</span>
                    <span>{t("User-centric design and features")}</span>
                  </div>
                  <div className="commitment-point">
                    <span className="point-icon">✓</span>
                    <span>{t("Sustainable agricultural practices")}</span>
                  </div>
                  <div className="commitment-point">
                    <span className="point-icon">✓</span>
                    <span>{t("Empowering rural communities")}</span>
                  </div>
                </div>
              </Card.Body>
            </Card>
          </div>
        </Container>
      </div>
      <Footer />
    </div>
  );
}

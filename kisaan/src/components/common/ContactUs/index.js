import React, { useEffect, useState } from "react";
import "./contactUs.css";
import { useHistory } from "react-router-dom";
import Header from "../../headerComponent";
import Footer from "../../footerComponent";
import {
  Container,
  Card,
  Row,
  Col,
  Form,
  Button,
  Alert,
  Badge,
} from "react-bootstrap";
import { hasAuthToken } from "../../../utils/cookies";

export default function ContactUs() {
  const history = useHistory();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });
  const [showAlert, setShowAlert] = useState(false);
  const [alertMessage, setAlertMessage] = useState("");
  const [alertType, setAlertType] = useState("success");

  useEffect(() => {
    if (!hasAuthToken()) {
      // Check token in cookies
      history.push("/");
    }
  }, [history]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    // Basic validation
    if (
      !formData.name ||
      !formData.email ||
      !formData.subject ||
      !formData.message
    ) {
      setAlertType("danger");
      setAlertMessage("Please fill in all fields.");
      setShowAlert(true);
      return;
    }

    // Simulate form submission
    setAlertType("success");
    setAlertMessage(
      "Thank you for your message! We'll get back to you within 24 hours."
    );
    setShowAlert(true);

    // Reset form
    setFormData({
      name: "",
      email: "",
      subject: "",
      message: "",
    });

    // Hide alert after 5 seconds
    setTimeout(() => {
      setShowAlert(false);
    }, 5000);
  };

  return (
    <div className="App-contact">
      <Header />
      <div className="App-header">
        <Container>
          <div className="header-section">
            <h2 className="page-title">Contact Us</h2>
            <Badge variant="primary" className="support-badge">
              24/7 Support Available
            </Badge>
          </div>

          {showAlert && (
            <Alert
              variant={alertType}
              dismissible
              onClose={() => setShowAlert(false)}
              className="alert-message"
            >
              {alertMessage}
            </Alert>
          )}

          <div className="contact-content">
            <Row>
              {/* Contact Information */}
              <Col lg={4} className="contact-info-col">
                <Card className="contact-info-card">
                  <Card.Body>
                    <h3 className="section-title">Get in Touch</h3>
                    <p className="section-description">
                      We're here to help! Reach out to us anytime and we'll get
                      back to you as soon as possible.
                    </p>

                    <div className="contact-methods">
                      <div className="contact-method">
                        <div className="method-icon">📧</div>
                        <div className="method-details">
                          <h5>Email Support</h5>
                          <p>support@khetihat.com</p>
                          <small>Response within 2-4 hours</small>
                        </div>
                      </div>

                      <div className="contact-method">
                        <div className="method-icon">📞</div>
                        <div className="method-details">
                          <h5>Phone Support</h5>
                          <p>+91 9369935639</p>
                          <small>Mon-Sun: 9:00 AM - 9:00 PM</small>
                        </div>
                      </div>
                    </div>

                    <div className="social-links">
                      <h5>Follow Us</h5>
                      <div className="social-icons">
                        <span className="social-icon">📘</span>
                        <span className="social-icon">🐦</span>
                        <span className="social-icon">📷</span>
                        <span className="social-icon">💼</span>
                      </div>
                    </div>
                  </Card.Body>
                </Card>
              </Col>

              {/* Contact Form */}
              <Col lg={8} className="contact-form-col">
                <Card className="contact-form-card">
                  <Card.Body>
                    <h3 className="section-title">Send us a Message</h3>
                    <p className="section-description">
                      Have a question, suggestion, or need help? Fill out the
                      form below and we'll respond promptly.
                    </p>

                    <Form onSubmit={handleSubmit} className="contact-form">
                      <Row>
                        <Col md={6}>
                          <Form.Group className="form-group">
                            <Form.Label>Full Name *</Form.Label>
                            <Form.Control
                              type="text"
                              name="name"
                              value={formData.name}
                              onChange={handleInputChange}
                              placeholder="Enter your full name"
                              className="form-input"
                              required
                            />
                          </Form.Group>
                        </Col>
                        <Col md={6}>
                          <Form.Group className="form-group">
                            <Form.Label>Email Address *</Form.Label>
                            <Form.Control
                              type="email"
                              name="email"
                              value={formData.email}
                              onChange={handleInputChange}
                              placeholder="Enter your email address"
                              className="form-input"
                              required
                            />
                          </Form.Group>
                        </Col>
                      </Row>

                      <Form.Group className="form-group">
                        <Form.Label>Subject *</Form.Label>
                        <Form.Control
                          as="select"
                          name="subject"
                          value={formData.subject}
                          onChange={handleInputChange}
                          className="form-input"
                          required
                        >
                          <option value="">Select a subject</option>
                          <option value="general">General Inquiry</option>
                          <option value="technical">Technical Support</option>
                          <option value="account">Account Issues</option>
                          <option value="payment">Payment & Billing</option>
                          <option value="partnership">
                            Partnership Opportunities
                          </option>
                          <option value="feedback">
                            Feedback & Suggestions
                          </option>
                          <option value="other">Other</option>
                        </Form.Control>
                      </Form.Group>

                      <Form.Group className="form-group">
                        <Form.Label>Message *</Form.Label>
                        <Form.Control
                          as="textarea"
                          rows={6}
                          name="message"
                          value={formData.message}
                          onChange={handleInputChange}
                          placeholder="Please describe your inquiry in detail..."
                          className="form-input"
                          required
                        />
                      </Form.Group>

                      <div className="form-actions">
                        <Button
                          type="submit"
                          className="submit-button"
                          size="lg"
                        >
                          Send Message
                        </Button>
                        <small className="form-note">
                          * Required fields. We typically respond within 24
                          hours.
                        </small>
                      </div>
                    </Form>
                  </Card.Body>
                </Card>
              </Col>
            </Row>

            {/* FAQ Section */}
            <Card className="faq-card">
              <Card.Body>
                <h3 className="section-title">Frequently Asked Questions</h3>
                <Row className="faq-grid">
                  <Col md={6} className="faq-col">
                    <div className="faq-item">
                      <h5 className="faq-question">
                        How do I register as a farmer?
                      </h5>
                      <p className="faq-answer">
                        Click on "Sign Up", fill in your details, verify your
                        phone number/email, and start listing your products.
                      </p>
                    </div>
                    <div className="faq-item">
                      <h5 className="faq-question">
                        Is the platform free to use?
                      </h5>
                      <p className="faq-answer">
                        Yes! Registration and basic features are completely
                        free. We only charge a small commission on successful
                        transactions.
                      </p>
                    </div>
                  </Col>
                  <Col md={6} className="faq-col">
                    <div className="faq-item">
                      <h5 className="faq-question">
                        What if I have technical issues?
                      </h5>
                      <p className="faq-answer">
                        Our technical support team is available 24/7. You can
                        reach us through live chat, email, or phone for
                        immediate assistance.
                      </p>
                    </div>
                  </Col>
                </Row>
              </Card.Body>
            </Card>
          </div>
        </Container>
      </div>
      <Footer />
    </div>
  );
}

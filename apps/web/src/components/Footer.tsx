import "./css/footer.css";
import { useTheme } from "../context/darkmodeContext";
import { Link } from "react-router-dom";
import { IconBrandGithub, IconBrandFacebook, IconBrandX } from '@tabler/icons-react';
import { useState } from "react";

export function Footer() {
	const { theme } = useTheme();
	const [showConstructionModal, setShowConstructionModal] = useState(false);

	const handleConstructionClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
		e.preventDefault();
		setShowConstructionModal(true);
	};

	const closeModal = () => {
		setShowConstructionModal(false);
	};

	return (
		<footer className="footer-container" data-theme={theme}>
			<div className="footer-content">
				{/* Left Section - Logo and Social */}
				<div className="footer-left">
					<div className="footer-logo">
						<img src="/readsy_logo.png" alt="Readsy" />
					</div>
					<div className="footer-socials">
						<a href="https://github.com/20HDMI04/End-Term-Project/wiki" target="_blank" rel="noopener noreferrer" title="GitHub">
							<IconBrandGithub size={20} />
						</a>
					<a href="#" onClick={handleConstructionClick} title="Facebook" style={{ cursor: 'pointer' }}>
						<IconBrandFacebook size={20} />
					</a>
					<a href="#" onClick={handleConstructionClick} title="X" style={{ cursor: 'pointer' }}>
						<IconBrandX size={20} />
					</a>
				</div>
				</div>

				{/* Right Section - Four Columns */}
				<div className="footer-columns">
					{/* Navigation Column */}
					<div className="footer-column">
						<h3>Navigation</h3>
						<ul>
							<li><Link to="/">Home</Link></li>
							<li><Link to="/search">Search</Link></li>
							<li><Link to="/discover">Discover</Link></li>
							<li><Link to="/">Library</Link></li>
						</ul>
					</div>

					{/* Company Column */}
					<div className="footer-column">
						<h3>Company</h3>
						<ul>
							<li><a href="#about">About</a></li>
							<li><a href="#careers">Careers</a></li>
							<li><a href="#contact">Contact</a></li>
							<li><a href="#press">Press Kit</a></li>
						</ul>
					</div>

					{/* Legal Column */}
					<div className="footer-column">
						<h3>Legal</h3>
						<ul>
							<li><a href="/privacy">Privacy Policy</a></li>
							<li><a href="/terms">Terms of Service</a></li>
							<li><a href="/cookies">Cookie Policy</a></li>
						</ul>
					</div>

					{/* Live Stats Column */}
					<div className="footer-column footer-stats">
						<h3>Live Stats</h3>
						<div className="stats-number">142,000+</div>
						<p className="stats-label">Curated volume currently available in the public archive.</p>
					</div>
				</div>
			</div>

			{/* Bottom Copyright Section */}
			<div className="footer-bottom">
				<p className="footer-copyright">© 2024 Readsy. Cultivating the digital library.</p>
				<p className="footer-credit">DESIGNED WITH INTENTION.</p>
			</div>

		{/* Under Construction Modal */}
		{showConstructionModal && (
			<div className="construction-modal-overlay" onClick={closeModal}>
				<div className="construction-modal-content" onClick={(e) => e.stopPropagation()}>
					<img 
						src="/underconstruction.jpg" 
						alt="Under Construction" 
						style={{ width: '100%', height: 'auto' }}
						onError={(e) => {
							console.error('Image failed to load:', e);
							(e.target as HTMLImageElement).style.backgroundColor = '#FFD700';
						}}
					/>
					<button className="construction-modal-close" onClick={closeModal}>✕</button>
				</div>
			</div>
		)}		</footer>
	);
}
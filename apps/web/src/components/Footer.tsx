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

				<div className="footer-columns">
					<div className="footer-column">
						<h3>Navigation</h3>
						<ul>
							<li><Link to="/">Home</Link></li>
							<li><Link to="/search">Search</Link></li>
							<li><Link to="/discover">Discover</Link></li>
							<li><Link to="/">Library</Link></li>
						</ul>
					</div>

					<div className="footer-column">
						<h3>Company</h3>
						<ul>
							<li><a href="#about" onClick={handleConstructionClick} style={{ cursor: 'pointer' }}>About</a></li>
							<li><a href="#careers" onClick={handleConstructionClick} style={{ cursor: 'pointer' }}>Careers</a></li>
							<li><a href="#contact" onClick={handleConstructionClick} style={{ cursor: 'pointer' }}>Contact</a></li>
							<li><a href="#press" onClick={handleConstructionClick} style={{ cursor: 'pointer' }}>Press Kit</a></li>
						</ul>
					</div>

					<div className="footer-column">
						<h3>Legal</h3>
						<ul>
							<li><a href="https://20hdmi04.github.io/ReadsyTermlySite/" style={{ cursor: 'pointer' }}>Privacy Policy</a></li>
							<li><a href="/terms" onClick={handleConstructionClick} style={{ cursor: 'pointer' }}>Terms of Service</a></li>
							<li><a href="/cookies" onClick={handleConstructionClick} style={{ cursor: 'pointer' }}>Cookie Policy</a></li>
						</ul>
					</div>

					<div className="footer-column footer-stats">
						<h3>Live Stats</h3>
						<div className="stats-number">1+</div>
						<p className="stats-label">Curated volume currently available in the public archive.</p>
					</div>
				</div>
			</div>


			<div className="footer-bottom">
				<p className="footer-copyright">© 2024 Readsy. Cultivating the digital library.</p>
				<p className="footer-credit">DESIGNED WITH INTENTION.</p>
			</div>

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
			)}
		</footer>
	);
}
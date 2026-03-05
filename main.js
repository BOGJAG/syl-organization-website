document.getElementById('leadForm').addEventListener('submit', async function (e) {
    e.preventDefault();

    const status = document.getElementById('formStatus');
    const submitBtn = e.target.querySelector('.btn-submit');

    // Gather data
    const formData = new FormData(this);
    const data = {
        name: formData.get('name'),
        email: formData.get('email'),
        phone: formData.get('phone'),
        timestamp: new Date().toISOString()
    };

    // UI Feedback
    submitBtn.disabled = true;
    submitBtn.textContent = 'Processing...';
    status.textContent = 'Optimizing your request...';
    status.style.color = 'var(--primary)';

    try {
        // Mocking a backend system call
        console.log('SYL System: Capturing Lead Data...', data);

        // In a real scenario, this would be a fetch() call to a server
        // We simulate a small delay
        await new Promise(resolve => setTimeout(resolve, 1500));

        status.textContent = 'Thank you! We will reach out to you shortly.';
        status.style.color = '#28a745';
        e.target.reset();

    } catch (error) {
        status.textContent = 'Something went wrong. Please try again.';
        status.style.color = '#dc3545';
    } finally {
        submitBtn.disabled = false;
        submitBtn.textContent = 'Get Started';
    }
});

// Scroll Reveal simple implementation
const reveal = () => {
    const sections = document.querySelectorAll('.glass');
    sections.forEach(s => {
        const windowHeight = window.innerHeight;
        const revealTop = s.getBoundingClientRect().top;
        const revealPoint = 150;

        if (revealTop < windowHeight - revealPoint) {
            s.style.opacity = '1';
            s.style.transform = 'translateY(0)';
            s.style.transition = 'all 1s ease-out';
        }
    });
};

window.addEventListener('scroll', reveal);
// Initial check
// Hero Background Slider
const heroSlider = document.querySelector('.hero-slider');
const dots = document.querySelectorAll('.dot');
let currentImageIndex = 0;
const totalSlides = dots.length;

const updateHeroBackground = (index) => {
    // Determine the next index
    const nextIndex = index !== undefined ? index : (currentImageIndex + 1) % totalSlides;
    currentImageIndex = nextIndex;

    // Slide the container setup
    if (heroSlider) {
        heroSlider.style.transform = `translateX(-${currentImageIndex * 100}%)`;
    }

    // Update dots
    dots.forEach(dot => dot.classList.remove('active'));
    if (dots[currentImageIndex]) {
        dots[currentImageIndex].classList.add('active');
    }
};

// Auto-rotate every 5 seconds
let slideInterval = setInterval(() => updateHeroBackground(), 5000);

// Dot Navigation
dots.forEach((dot, index) => {
    dot.addEventListener('click', () => {
        clearInterval(slideInterval); // Reset timer on interaction
        updateHeroBackground(index);
        slideInterval = setInterval(() => updateHeroBackground(), 5000);
    });
});


window.addEventListener('scroll', reveal);
// Initial check
// Initial check
reveal();

// Service Modal Data
const serviceDetails = {
    'Closet Design': {
        img: 'images/syl_closet_v2.png',
        desc: "Transform your closet into a personalized boutique. We design custom layouts that showcase your wardrobe perfectly while maximizing every inch of space."
    },
    'Pantry & Kitchen': {
        img: 'images/syl_pantry_v2.png',
        desc: "The heart of the home deserves to be beautiful. We create functional pantry layouts that make cooking a joy, ensuring every ingredient has its perfect place."
    },
    'Workspaces': {
        img: 'images/syl_office_v2.png',
        desc: "Clear space, clear mind. We optimize your home office for maximum productivity, creating an environment where focus comes naturally."
    },
    'Utility Rooms': {
        img: 'images/syl_laundry_v2.png',
        desc: "Elevating the everyday. Even utilitarian spaces like laundry rooms can be serene and efficient. Let us bring order to your daily routines."
    }
};

// Modal Logic
const modal = document.getElementById('serviceModal');
const modalImg = document.getElementById('modalImage');
const modalGallery = document.getElementById('modalGallery');
const modalTitle = document.getElementById('modalTitle');
const modalDesc = document.getElementById('modalDescription');
const closeModal = document.querySelector('.close-modal');

// Fullscreen Viewer Logic
const fullscreenViewer = document.getElementById('fullscreenViewer');
const fullscreenImg = document.getElementById('fullscreenImg');
const closeViewer = document.querySelector('.close-viewer');

document.querySelectorAll('.service-card').forEach(card => {
    card.addEventListener('click', () => {
        const title = card.querySelector('h3').innerText;
        let key = title;
        if (title.includes('Laundry')) key = 'Utility Rooms';
        if (title.includes('Pantry')) key = 'Pantry & Kitchen';

        const details = serviceDetails[key] || serviceDetails[title];

        if (details) {
            modalTitle.innerText = title;
            modalDesc.innerText = details.desc;
            modalImg.src = details.img;

            modalImg.style.display = 'block';
            if (modalGallery) modalGallery.style.display = 'none';

            modal.style.display = 'flex';
            modal.classList.add('show');
            document.body.style.overflow = 'hidden';

            modalImg.style.cursor = 'pointer';
        }
    });
});

if (modalImg) {
    modalImg.addEventListener('click', () => {
        if (modalImg.src) {
            fullscreenImg.src = modalImg.src;
            fullscreenViewer.style.display = 'flex';
            fullscreenViewer.classList.add('show');
        }
    });
}

document.querySelectorAll('.gallery-img').forEach(img => {
    img.addEventListener('click', () => {
        modalTitle.innerText = img.alt;
        modalDesc.innerText = 'SYL Organization Transformation';

        let images = [img.src];

        if (img.alt.includes('Closet')) {
            images = [
                'images/gallery_closet_new.png',
                'images/closet_multi_1.png',
                'images/closet_multi_new_1772670716178.png',
                'images/syl_luxury_closet_4k_1767926338314.png',
                'images/closet_multi_5_1772581184410.png',
                'images/closet_multi_6_1772581201712.png'
            ];
        } else if (img.alt.includes('Pantry') || img.src.includes('pantry')) {
            images = [
                'images/pantry_multi_1_1772580243334.png',
                'images/pantry_multi_2_1772580256273.png',
                'images/pantry_multi_3_new_1772674089939.png',
                'images/pantry_multi_4_1772580284440.png',
                'images/pantry_multi_5_1772581216092.png',
                'images/pantry_multi_6_1772581233841.png'
            ];
        } else if (img.alt.includes('Office') || img.src.includes('office')) {
            images = [
                'images/office_multi_1_1772580481579.png',
                'images/office_multi_2_1772580494832.png',
                'images/office_multi_3_1772580505097.png',
                'images/office_multi_4_1772580519614.png',
                'images/office_multi_5_1772581424118.png',
                'images/office_multi_6_1772669391259.png'
            ];
        } else if (img.alt.includes('Laundry') || img.src.includes('laundry')) {
            images = [
                'images/laundry_multi_1_1772580580944.png',
                'images/laundry_multi_2_1772580593747.png',
                'images/laundry_multi_3_1772580611860.png',
                'images/laundry_multi_4_1772580628799.png',
                'images/laundry_multi_5_1772669403757.png',
                'images/laundry_multi_6_1772669414229.png'
            ];
        }

        if (images.length > 1 && modalGallery) {
            modalImg.style.display = 'none';
            modalGallery.style.display = 'grid';
            modalGallery.innerHTML = '';
            images.forEach(src => {
                const gridImg = document.createElement('img');
                gridImg.src = src;
                gridImg.style.width = '100%';
                gridImg.style.height = '150px';
                gridImg.style.objectFit = 'cover';
                gridImg.style.borderRadius = '8px';
                gridImg.style.cursor = 'pointer';

                gridImg.addEventListener('click', () => {
                    fullscreenImg.src = src;
                    fullscreenViewer.style.display = 'flex';
                    fullscreenViewer.classList.add('show');
                });

                modalGallery.appendChild(gridImg);
            });
        } else {
            modalImg.style.display = 'block';
            if (modalGallery) modalGallery.style.display = 'none';
            modalImg.src = images[0];
        }

        modal.style.display = 'flex';
        modal.classList.add('show');
        document.body.style.overflow = 'hidden';
    });
});

if (closeModal) {
    closeModal.addEventListener('click', () => {
        modal.classList.remove('show');
        modal.style.display = 'none';
        document.body.style.overflow = 'auto';
    });
}

if (closeViewer) {
    closeViewer.addEventListener('click', () => {
        fullscreenViewer.classList.remove('show');
        fullscreenViewer.style.display = 'none';
    });
}

window.addEventListener('click', (e) => {
    if (e.target === modal) {
        modal.classList.remove('show');
        modal.style.display = 'none';
        document.body.style.overflow = 'auto';
    }
    if (e.target === fullscreenViewer) {
        fullscreenViewer.classList.remove('show');
        fullscreenViewer.style.display = 'none';
    }
});

// --- 3D Interactions & Background ---

// 1. 3D Tilt Effect for Cards
document.querySelectorAll('.tilt-card').forEach(card => {
    card.addEventListener('mousemove', (e) => {
        const rect = card.getBoundingClientRect();
        const x = e.clientX - rect.left; // x position within the element
        const y = e.clientY - rect.top;  // y position within the element

        const centerX = rect.width / 2;
        const centerY = rect.height / 2;

        const rotateX = ((y - centerY) / centerY) * -10; // Max rotation 10deg
        const rotateY = ((x - centerX) / centerX) * 10;

        card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
    });

    card.addEventListener('mouseleave', () => {
        card.style.transform = `perspective(1000px) rotateX(0deg) rotateY(0deg)`;
        card.style.transition = 'transform 0.5s ease';
    });

    card.addEventListener('mouseenter', () => {
        card.style.transition = 'none'; // Remove transition for smooth tracking
    });
});

// 2. Three.js Background Animation
const initThreeJS = () => {
    const canvas = document.getElementById('bg-canvas');
    if (!canvas) return;

    // Scene setup
    const scene = new THREE.Scene();

    // Camera setup
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.z = 30;

    // Renderer setup
    const renderer = new THREE.WebGLRenderer({ canvas: canvas, alpha: true, antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(window.devicePixelRatio);

    // Create Particles/Shapes
    const geometry = new THREE.IcosahedronGeometry(1, 0);

    // Luxurious Materials
    const materialPrimary = new THREE.MeshPhysicalMaterial({
        color: 0x4392a6, // Primary
        metalness: 0.1,
        roughness: 0.2,
        transmission: 0.9, // glass-like
        thickness: 0.5
    });

    const materialAccent = new THREE.MeshPhysicalMaterial({
        color: 0xd4a373, // Accent
        metalness: 0.8,
        roughness: 0.2,
    });

    const group = new THREE.Group();
    scene.add(group);

    // Shapes removed as requested by user.

    // Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(ambientLight);

    const dirLight = new THREE.DirectionalLight(0xffffff, 1);
    dirLight.position.set(10, 20, 10);
    scene.add(dirLight);

    // Mouse Interaction
    let mouseX = 0;
    let mouseY = 0;
    let targetX = 0;
    let targetY = 0;

    const windowHalfX = window.innerWidth / 2;
    const windowHalfY = window.innerHeight / 2;

    document.addEventListener('mousemove', (event) => {
        mouseX = (event.clientX - windowHalfX) * 0.05;
        mouseY = (event.clientY - windowHalfY) * 0.05;
    });

    // Scroll Interaction
    let scrollY = 0;
    window.addEventListener('scroll', () => {
        scrollY = window.scrollY * 0.01;
    });

    // Handle Resize
    window.addEventListener('resize', () => {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
    });

    // Animation Loop
    const clock = new THREE.Clock();

    const animate = () => {
        requestAnimationFrame(animate);
        const elapsedTime = clock.getElapsedTime();

        targetX = mouseX * .001;
        targetY = mouseY * .001;

        // Rotate group based on mouse
        group.rotation.y += 0.05 * (targetX - group.rotation.y);
        group.rotation.x += 0.05 * (targetY - group.rotation.x);

        // General slow rotation
        group.rotation.y += 0.002;

        // Move camera slightly on scroll
        camera.position.y = -scrollY;

        // Animate individual meshes
        group.children.forEach((mesh, i) => {
            mesh.rotation.x += 0.005;
            mesh.rotation.y += 0.01;
            // Gentle bobbing
            mesh.position.y += Math.sin(elapsedTime * 0.5 + i) * 0.02;
        });

        renderer.render(scene, camera);
    };

    animate();
};

// Initialize Three.js when DOM is loaded
document.addEventListener('DOMContentLoaded', initThreeJS);

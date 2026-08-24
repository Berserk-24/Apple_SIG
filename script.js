        function reveal() {
            var reveals = document.querySelectorAll(".reveal");
            for (var i = 0; i < reveals.length; i++) {
                var windowHeight = window.innerHeight;
                var elementTop = reveals[i].getBoundingClientRect().top;
                var elementVisible = 100; // Cuántos pixeles antes de aparecer
                
                if (elementTop < windowHeight - elementVisible) {
                    reveals[i].classList.add("active");
                }
            }
        }
        
        // Ejecutar al hacer scroll
        window.addEventListener("scroll", reveal);
        // Ejecutar una vez al cargar por si elementos ya están en pantalla
        reveal();

        function smoothScrollTo(targetY) {
            var startY = window.scrollY || window.pageYOffset;
            var distance = targetY - startY;
            var absDistance = Math.abs(distance);
            var duration = Math.min(780, Math.max(300, absDistance * 0.35));
            var startTime = null;

            function easeOutCubic(t) {
                return 1 - Math.pow(1 - t, 3);
            }

            function animationStep(timestamp) {
                if (!startTime) {
                    startTime = timestamp;
                }

                var elapsed = timestamp - startTime;
                var progress = Math.min(elapsed / duration, 1);
                var eased = easeOutCubic(progress);
                window.scrollTo(0, startY + distance * eased);

                if (progress < 1) {
                    window.requestAnimationFrame(animationStep);
                }
            }

            window.requestAnimationFrame(animationStep);
        }

        var navLinks = document.querySelectorAll('nav a[href^="#"]');
        for (var j = 0; j < navLinks.length; j++) {
            navLinks[j].addEventListener("click", function (event) {
                var href = this.getAttribute("href");
                var target = document.querySelector(href);
                if (!target) {
                    return;
                }

                event.preventDefault();

                var nav = document.querySelector("nav");
                var navHeight = nav ? nav.offsetHeight : 0;
                var top = target.getBoundingClientRect().top + (window.scrollY || window.pageYOffset) - navHeight + 80;

                if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
                    window.scrollTo(0, top);
                } else {
                    smoothScrollTo(top);
                }

                history.replaceState(null, "", href);
            });
        }

        var modal = document.getElementById("imageModal");
        var modalImg = document.getElementById("expandedImg");
        var closeBtn = document.querySelector(".close-btn");
        var images = document.querySelectorAll(".image-placeholder img");

        function closeModal() {
            if (!modal) {
                return;
            }

            modal.classList.remove("show");
            document.body.style.overflow = "";
            setTimeout(function () {
                modal.style.display = "none";
                modal.setAttribute("aria-hidden", "true");
            }, 300);
        }

        for (var k = 0; k < images.length; k++) {
            images[k].addEventListener("click", function () {
                if (!modal || !modalImg) {
                    return;
                }

                modal.style.display = "flex";
                modal.setAttribute("aria-hidden", "false");
                modalImg.src = this.src;
                modalImg.alt = this.alt || "Vista ampliada";
                document.body.style.overflow = "hidden";
                requestAnimationFrame(function () {
                    modal.classList.add("show");
                });
            });
        }

        if (closeBtn) {
            closeBtn.addEventListener("click", closeModal);
        }

        if (modal) {
            modal.addEventListener("click", function (event) {
                if (event.target === modal) {
                    closeModal();
                }
            });
        }

        document.addEventListener("keydown", function (event) {
            if (event.key === "Escape" && modal && modal.classList.contains("show")) {
                closeModal();
            }
        });

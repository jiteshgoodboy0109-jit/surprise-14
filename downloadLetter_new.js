function downloadLetter() {
    console.log("=== PDF DOWNLOAD STARTED ===");

    // Get the FULL letter text from the source template
    const template = document.getElementById('scene-3-template');
    console.log("Template found:", !!template);

    const textTarget = template ? template.querySelector('#source-text-3') : null;
    console.log("Source text element found:", !!textTarget);

    if (!textTarget) {
        alert("Letter content not found! Please try again. ✨");
        console.error("Could not find #source-text-3 in template");
        return;
    }

    const fullContent = textTarget.innerText.trim();
    console.log("📝 Letter content captured:");
    console.log("   Length:", fullContent.length, "characters");
    console.log("   First 150 chars:", fullContent.substring(0, 150));
    console.log("   Last 100 chars:", fullContent.substring(fullContent.length - 100));

    if (!fullContent || fullContent.length < 10) {
        alert("Letter content is empty or too short! ✨");
        console.error("Content too short:", fullContent);
        return;
    }

    // Create PDF container
    const printContainer = document.createElement('div');
    printContainer.id = 'pdf-letter-container';
    printContainer.style.width = '800px';
    printContainer.style.backgroundColor = '#ffffff';
    printContainer.style.padding = '60px 50px';
    printContainer.style.boxSizing = 'border-box';
    printContainer.style.minHeight = '1000px';
    printContainer.style.position = 'relative';

    // Add ruled lines background
    const lineHeight = '36pt';
    printContainer.style.lineHeight = lineHeight;
    printContainer.style.backgroundImage = 'repeating-linear-gradient(transparent, transparent 35pt, #e5e7eb 35pt, #e5e7eb 36pt)';
    printContainer.style.backgroundSize = '100% 36pt';

    // Header with date
    const header = document.createElement('div');
    header.style.textAlign = 'right';
    header.style.marginBottom = '30px';
    header.style.color = '#94a3b8';
    header.style.fontSize = '14pt';
    header.style.fontFamily = "'Nunito', sans-serif";
    header.style.lineHeight = '1.5';
    const dateStr = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
    header.textContent = dateStr;
    printContainer.appendChild(header);

    // Letter body - CRITICAL PART
    const body = document.createElement('div');
    body.style.fontSize = '20pt';
    body.style.color = '#1e293b';
    body.style.whiteSpace = 'pre-wrap';
    body.style.wordWrap = 'break-word';
    body.style.fontFamily = "'Dancing Script', cursive";
    body.style.lineHeight = lineHeight;
    body.style.width = '100%';

    // Set the content - THIS IS THE KEY LINE
    body.textContent = fullContent;
    console.log("Body element created, content set");
    console.log("Body textContent length:", body.textContent.length);

    printContainer.appendChild(body);

    // Feather decoration
    const feather = document.createElement('div');
    feather.style.position = 'absolute';
    feather.style.right = '30px';
    feather.style.bottom = '30px';
    feather.style.opacity = '0.06';
    feather.style.fontSize = '60pt';
    feather.textContent = '🪶';
    printContainer.appendChild(feather);

    // Append to body (hidden off-screen)
    printContainer.style.position = 'fixed';
    printContainer.style.left = '-10000px';
    printContainer.style.top = '0';
    document.body.appendChild(printContainer);

    console.log("Container appended to body");
    console.log("Container innerHTML length:", printContainer.innerHTML.length);

    // PDF options
    const opt = {
        margin: 0.5,
        filename: 'Love_Letter_To_Nila.pdf',
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: {
            scale: 2,
            useCORS: true,
            logging: true,
            letterRendering: true
        },
        jsPDF: {
            unit: 'in',
            format: 'letter',
            orientation: 'portrait'
        }
    };

    if (window.html2pdf) {
        console.log("html2pdf library found, generating PDF...");
        setTimeout(() => {
            html2pdf().set(opt).from(printContainer).save().then(() => {
                console.log("✅ PDF GENERATED SUCCESSFULLY!");
                document.body.removeChild(printContainer);
            }).catch(err => {
                console.error("❌ PDF Generation Error:", err);
                alert("PDF generation failed. Check console for details. 💫");
                if (document.body.contains(printContainer)) {
                    document.body.removeChild(printContainer);
                }
            });
        }, 500);
    } else {
        console.error("html2pdf library not loaded!");
        alert("PDF library not ready. Please refresh and try again! ✨");
        document.body.removeChild(printContainer);
    }
}

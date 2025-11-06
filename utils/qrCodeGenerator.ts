import QRCode from 'qrcode';

// Generates a path for an SVG QR code from string data.
export const generateQrCodeSvgPath = (data: string): Promise<string> => {
    return new Promise((resolve, reject) => {
        try {
            const qrcode = QRCode.create(data, { errorCorrectionLevel: 'M' });
            
            if (!qrcode || !qrcode.modules) {
                console.error('QR code generation resulted in empty modules.');
                return reject('Empty modules from QR code generator');
            }
            
            // The modules data is a flat Uint8ClampedArray where 1 is black and 0 is white.
            const modules = qrcode.modules.data;
            const size = qrcode.modules.size;
            let path = '';
            
            // The component using this path has a hardcoded viewBox of "0 0 45 45".
            // We scale our QR code to fit into that viewbox.
            const scale = 45 / size;

            for (let y = 0; y < size; y++) {
                for (let x = 0; x < size; x++) {
                    if (modules[y * size + x] === 1) {
                        // M = moveto, h = horizontal line, v = vertical line, z = close path
                        // Using toFixed for cleaner SVG path data.
                        path += `M${(x * scale).toFixed(3)},${(y * scale).toFixed(3)}h${scale.toFixed(3)}v${scale.toFixed(3)}h-${scale.toFixed(3)}z `;
                    }
                }
            }
            resolve(path);
        } catch(err) {
            console.error('QR code generation failed:', err);
            reject(err);
        }
    });
};
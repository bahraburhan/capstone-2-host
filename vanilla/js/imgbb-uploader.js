// Simple image upload service using ImgBB
document.addEventListener('firebase-ready', () => {
    console.log('Setting up ImgBB image uploader');
    
    // ImgBB API key
    const IMGBB_API_KEY = 'f4c2c4221fda2da9b50e23693e54f6b0'; // User's API key
    
    // Function to upload an image to ImgBB and get the URL
    window.uploadImageToImgBB = async (file) => {
        try {
            console.log('Uploading image to ImgBB:', file.name);
            
            // Convert file to base64
            const base64data = await fileToBase64(file);
            const base64Image = base64data.split(',')[1]; // Remove the data:image/xxx;base64, part
            
            // Create form data
            const formData = new FormData();
            formData.append('key', IMGBB_API_KEY);
            formData.append('image', base64Image);
            formData.append('name', file.name);
            
            // Show loading state
            console.log('Sending image to ImgBB...');
            
            // Send to ImgBB API
            console.log('Sending request to ImgBB with API key:', IMGBB_API_KEY.substring(0, 5) + '...');
            
            const response = await fetch('https://api.imgbb.com/1/upload', {
                method: 'POST',
                body: formData
            });
            
            // Log response status
            console.log('ImgBB API response status:', response.status, response.statusText);
            
            const result = await response.json();
            console.log('ImgBB API full response:', result);
            
            if (result.success) {
                console.log('Image uploaded successfully to ImgBB:', result.data.url);
                return {
                    success: true,
                    url: result.data.url,
                    deleteUrl: result.data.delete_url,
                    displayUrl: result.data.display_url
                };
            } else {
                const errorMessage = result.error?.message || 
                                    (result.status_txt ? `${result.status_txt}: ${result.error?.message || ''}` : 'Unknown error');
                
                console.error('ImgBB upload failed:', errorMessage, result);
                alert(`Image upload to ImgBB failed: ${errorMessage}. Please try again or use an image URL.`);
                
                return {
                    success: false,
                    error: errorMessage,
                    fullError: result
                };
            }
        } catch (error) {
            console.error('Error uploading to ImgBB:', error);
            return {
                success: false,
                error: error.message
            };
        }
    };
    
    // Helper function to convert file to base64
    const fileToBase64 = (file) => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = () => resolve(reader.result);
            reader.onerror = (error) => reject(error);
        });
    };
});

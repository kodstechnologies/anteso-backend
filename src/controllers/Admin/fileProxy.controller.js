import { asyncHandler } from "../../utils/AsyncHandler.js";
import https from "https";
import http from "http";

/**
 * Extract the actual S3 key from a URL or return the key if it's already clean
 * Uses the same logic as s3Fetch.js
 */
const extractKey = (keyOrUrl) => {
  if (!keyOrUrl) return null;

  try {
    // If it's a full S3 URL, extract the pathname after the bucket domain
    if (keyOrUrl.startsWith("http")) {
      const url = new URL(keyOrUrl);
      
      // Check if it's virtual-hosted-style (bucket-name.s3.region.amazonaws.com)
      // or path-style (s3.region.amazonaws.com/bucket-name/key)
      const isVirtualHostedStyle = url.hostname.includes(".s3.") || url.hostname.includes(".s3-");
      
      if (isVirtualHostedStyle) {
        // Virtual-hosted-style: https://bucket-name.s3.region.amazonaws.com/key
        // The pathname is the key (remove leading slash)
        return decodeURIComponent(url.pathname.replace(/^\/+/, ""));
      } else {
        // Path-style: https://s3.region.amazonaws.com/bucket-name/key
        // First segment is bucket name, rest is the key
        const pathParts = url.pathname.replace(/^\/+/, "").split("/");
        if (pathParts.length > 1) {
          // Remove bucket name (first part), join the rest as key
          return decodeURIComponent(pathParts.slice(1).join("/"));
        }
        // If only one part, it might be just the key or just the bucket
        return decodeURIComponent(pathParts[0] || "");
      }
    }
    // Otherwise return as-is (already a key)
    return keyOrUrl.trim();
  } catch (error) {
    console.error("Error extracting key:", error);
    return keyOrUrl.trim();
  }
};

// Proxy file from S3 using direct HTTP fetch (bypasses IAM permissions)
// Since bucket policy allows public access, we can fetch directly via HTTP
export const proxyFile = asyncHandler(async (req, res) => {
  const { fileUrl } = req.query;

  if (!fileUrl) {
    return res.status(400).json({
      success: false,
      message: "File URL is required",
    });
  }

  try {
    // Validate URL
    let url;
    try {
      url = new URL(fileUrl);
    } catch (error) {
      return res.status(400).json({
        success: false,
        message: "Invalid file URL",
      });
    }

    console.log("🚀 Proxying file from URL:", fileUrl);

    // Determine protocol
    const protocol = url.protocol === "https:" ? https : http;

    // Fetch file directly via HTTP (bucket policy allows public access)
    // This bypasses IAM permissions since we're not using AWS SDK
    return new Promise((resolve, reject) => {
      protocol.get(url.href, (response) => {
        // Check if request was successful
        if (response.statusCode !== 200) {
          console.error(`❌ Failed to fetch file: ${response.statusCode} ${response.statusMessage}`);
          res.status(response.statusCode || 500).json({
            success: false,
            message: `Failed to fetch file: ${response.statusMessage || "Unknown error"}`,
            statusCode: response.statusCode,
          });
          return resolve(null);
        }

        // Set CORS headers (backend to frontend, no CORS issues)
        res.setHeader("Access-Control-Allow-Origin", "*");
        res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
        res.setHeader("Access-Control-Allow-Headers", "Content-Type");

        // Set content type from response or default
        const contentType = response.headers["content-type"] || "application/octet-stream";
        res.setHeader("Content-Type", contentType);

        // Set content length if available
        if (response.headers["content-length"]) {
          res.setHeader("Content-Length", response.headers["content-length"]);
        }

        console.log("✅ Successfully fetching file, streaming to client...");

        // Pipe the response directly to the client
        response.pipe(res);
        
        response.on("end", () => {
          console.log("✅ File streamed successfully");
          resolve(null);
        });
      }).on("error", (error) => {
        console.error("❌ Error proxying file:", error);
        res.status(500).json({
          success: false,
          message: `Failed to proxy file: ${error.message}`,
        });
        reject(error);
      });
    });
  } catch (error) {
    console.error("❌ Error in proxyFile:", error);
    res.status(500).json({
      success: false,
      message: `Server error: ${error.message}`,
    });
  }
});

export default { proxyFile };


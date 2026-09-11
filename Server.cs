using System;
using System.IO;
using System.Net;
using System.Text;
using System.Threading;

public class SimpleWebServer {
    public static void Main(string[] args) {
        int port = 5000;
        if (args.Length > 0) {
            int p;
            if (int.TryParse(args[0], out p)) port = p;
        }

        string root = AppDomain.CurrentDomain.BaseDirectory;
        HttpListener listener = new HttpListener();
        listener.Prefixes.Add("http://localhost:" + port + "/");
        listener.Prefixes.Add("http://127.0.0.1:" + port + "/");

        try {
            listener.Start();
            Console.WriteLine("SERVER_RUNNING:http://localhost:" + port + "/");
        } catch (Exception ex) {
            Console.WriteLine("START_ERROR: " + ex.Message);
            return;
        }

        while (listener.IsListening) {
            try {
                HttpListenerContext context = listener.GetContext();
                ThreadPool.QueueUserWorkItem(new WaitCallback(delegate(object state) {
                    ProcessRequest((HttpListenerContext)state, root);
                }), context);
            } catch {
                break;
            }
        }
    }

    private static void ProcessRequest(HttpListenerContext ctx, string root) {
        try {
            HttpListenerRequest req = ctx.Request;
            HttpListenerResponse res = ctx.Response;

            res.AddHeader("Access-Control-Allow-Origin", "*");
            res.AddHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
            res.AddHeader("Access-Control-Allow-Headers", "*");

            if (req.HttpMethod == "OPTIONS") {
                res.StatusCode = 200;
                res.Close();
                return;
            }

            string rawPath = req.Url.LocalPath.TrimStart('/');
            if (string.IsNullOrEmpty(rawPath) || rawPath == "index.html") {
                rawPath = "index.html";
            } else if (rawPath == "api/safety_data") {
                rawPath = "safe_spots.json";
            }

            string localPath = rawPath.Replace('/', Path.DirectorySeparatorChar);
            string filePath = Path.Combine(root, localPath);

            if (!File.Exists(filePath)) {
                string alt1 = Path.Combine(root, "static", localPath);
                string alt2 = Path.Combine(root, "templates", localPath);
                if (File.Exists(alt1)) filePath = alt1;
                else if (File.Exists(alt2)) filePath = alt2;
            }

            if (File.Exists(filePath)) {
                string ext = Path.GetExtension(filePath).ToLower();
                string contentType = "application/octet-stream";
                switch (ext) {
                    case ".html": contentType = "text/html; charset=utf-8"; break;
                    case ".css": contentType = "text/css; charset=utf-8"; break;
                    case ".js": contentType = "application/javascript; charset=utf-8"; break;
                    case ".json": contentType = "application/json; charset=utf-8"; break;
                    case ".png": contentType = "image/png"; break;
                    case ".jpg": case ".jpeg": contentType = "image/jpeg"; break;
                    case ".svg": contentType = "image/svg+xml"; break;
                    case ".ico": contentType = "image/x-icon"; break;
                }

                byte[] bytes = File.ReadAllBytes(filePath);
                res.ContentType = contentType;
                res.ContentLength64 = bytes.Length;
                res.StatusCode = 200;
                res.OutputStream.Write(bytes, 0, bytes.Length);
            } else {
                res.StatusCode = 404;
                byte[] err = Encoding.UTF8.GetBytes("404 Not Found: " + rawPath);
                res.ContentType = "text/plain; charset=utf-8";
                res.ContentLength64 = err.Length;
                res.OutputStream.Write(err, 0, err.Length);
            }
        } catch (Exception ex) {
            Console.WriteLine("REQ_ERR: " + ex.Message);
        } finally {
            try { ctx.Response.OutputStream.Close(); } catch {}
        }
    }
}

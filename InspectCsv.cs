using System;
using System.IO;
using System.Text;

public class CsvInspector {
    public static void Main(string[] args) {
        string dir = @"C:\Users\YG_home\Downloads";
        string targetFile = null;
        foreach (var f in Directory.GetFiles(dir, "*.csv", SearchOption.AllDirectories)) {
            if (f.Contains("경남") || f.Contains("202606")) {
                targetFile = f;
                break;
            }
        }

        if (targetFile == null) {
            Console.WriteLine("CSV not found");
            return;
        }

        Console.WriteLine("TARGET: " + targetFile);
        using (var reader = new StreamReader(targetFile, Encoding.Default)) {
            for (int i = 0; i < 3; i++) {
                string line = reader.ReadLine();
                if (line == null) break;
                Console.WriteLine("LINE " + i + ": " + line);
            }
        }
    }
}

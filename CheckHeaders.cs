using System;
using System.IO;
using System.Text;

public class CsvHeadersCheck {
    public static void Main(string[] args) {
        string cctvFile = @"C:\Users\YG_home\Downloads\경상남도 진주시_CCTV위치정보_20260507.csv";
        string lightFile = @"C:\Users\YG_home\Downloads\경상남도 진주시_가로등 정보_20260720.csv";

        Console.WriteLine("=== CCTV FILE HEADER ===");
        if (File.Exists(cctvFile)) {
            using (var reader = new StreamReader(cctvFile, Encoding.Default)) {
                string h = reader.ReadLine();
                Console.WriteLine("Default: " + h);
            }
            using (var reader = new StreamReader(cctvFile, Encoding.UTF8)) {
                string h = reader.ReadLine();
                Console.WriteLine("UTF8: " + h);
                string row1 = reader.ReadLine();
                Console.WriteLine("ROW1: " + row1);
            }
        } else {
            Console.WriteLine("CCTV file not found");
        }

        Console.WriteLine("\n=== LIGHT FILE HEADER ===");
        if (File.Exists(lightFile)) {
            using (var reader = new StreamReader(lightFile, Encoding.Default)) {
                string h = reader.ReadLine();
                Console.WriteLine("Default: " + h);
            }
            using (var reader = new StreamReader(lightFile, Encoding.UTF8)) {
                string h = reader.ReadLine();
                Console.WriteLine("UTF8: " + h);
                string row1 = reader.ReadLine();
                Console.WriteLine("ROW1: " + row1);
            }
        } else {
            Console.WriteLine("LIGHT file not found");
        }
    }
}

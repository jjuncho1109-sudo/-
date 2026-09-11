using System;
using System.IO;
using System.Text;

public class EuckrHeaderAnalyzer {
    public static void Main(string[] args) {
        Encoding euckr = Encoding.GetEncoding("euc-kr");
        string cctvFile = @"C:\Users\YG_home\Downloads\경상남도 진주시_CCTV위치정보_20260507.csv";
        string lightFile = @"C:\Users\YG_home\Downloads\경상남도 진주시_가로등 정보_20260720.csv";

        Console.WriteLine("=== CCTV EUC-KR ===");
        using (var reader = new StreamReader(cctvFile, euckr)) {
            for (int i = 0; i < 4; i++) {
                Console.WriteLine("CCTV " + i + ": " + reader.ReadLine());
            }
        }

        Console.WriteLine("\n=== LIGHT EUC-KR ===");
        using (var reader = new StreamReader(lightFile, euckr)) {
            for (int i = 0; i < 4; i++) {
                Console.WriteLine("LIGHT " + i + ": " + reader.ReadLine());
            }
        }
    }
}

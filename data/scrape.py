import requests
import bs4
import string
from io import open
with open("brin.txt") as f:
    codes = f.readlines()
##codes = [
##"23EU",
##"17CN"
##  ]
url = 'http://www.onderwijsinspectie.nl/zoek-en-vergelijk?searchtype=generic&zoekterm=[code]&pagina=1'
codes = list(reversed(codes))
with open('output.csv', 'w', encoding='latin-1') as outputFile:
    outputFile.write(u'BRIN,financieel,overig\n')
    i = 1
    for code in codes:
        try:
            print(i,'/',len(codes))
            i = i + 1
            outputFile.write(code.rstrip())
            fullURL = url.replace('[code]', code)
            res = requests.get(fullURL)
            res.raise_for_status()
            soup = bs4.BeautifulSoup(res.text, "html.parser")

            status_array = soup.select('span .status-label')

            for status in status_array:
                outputFile.write(","+status.getText())
            outputFile.write(u'\n')
        except:
            print("error:",sys.exc_info()[0])
        


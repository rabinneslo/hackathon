#!python
import csv, io, json, string, re, requests

def main():
    # woonplaatsen = list(parseWoonplaatsLeerlingen(readCSV('woonplaatsen_leerlingen.csv', delimeter=',')))
    # with open('woonplaatse.json', 'w', encoding='latin-1') as f:
    #     json_string = json.dumps(woonplaatsen, ensure_ascii=False)
    #     f.write(json_string)

    # personeel = list(parsePersoneel(readCSV('personeel_basisscholen.csv')))
    # with open('personeel.json', 'w', encoding='latin-1') as f:
    #     json_string = json.dumps(personeel, ensure_ascii=False)
    #     f.write(json_string)

    # pks = list(parsePersoneelsKosten(readCSV('pk.csv', delimeter=',')))
    # with open('pk.json', 'w', encoding='latin-1') as f:
    #     json_string = json.dumps(pks, ensure_ascii=False)
    #     f.write(json_string)

    # mi = list(parseMI(readCSV('mi.csv', delimeter=',')))
    # with open('mi.json', 'w', encoding='latin-1') as f:
    #     json_string = json.dumps(mi, ensure_ascii=False)
    #     f.write(json_string)
    # scores = list(parseCitoScores(readCSV('cito_basisscholen.csv')))
    # with open('cito.json', 'w', encoding='latin-1') as f:
    #     json_string = json.dumps(scores, ensure_ascii=False)
    #     f.write(json_string)

    # leerlingen = list(parseLeerlingen(readCSV('leeftijden_basisscholen.csv')))
    # with open('leerlingen.json', 'w', encoding='latin-1') as f:
    #     json_string = json.dumps(leerlingen, ensure_ascii=False)
    #     f.write(json_string)    
    # besturen = list(parseBevoegdGezag(readCSV('bevoegdgezag.csv')))
    # with open('besturen.json', 'w', encoding='latin-1') as f:
    #      json_string = json.dumps(besturen, ensure_ascii=False)
    #      f.write(json_string)

    scholen = list(parseScholen(readCSV('basisscholenvestiging.csv',delimeter=',')))

    with open('scholen.json', 'w', encoding='latin-1') as f:
         json_string = json.dumps(scholen, ensure_ascii=False)
         f.write(json_string)
    # for bestuur in besturen:
    #     bestuur['scholen'] = [school for school in scholen if school['bg_nr'] == bestuur['bg_nr']]
    
    # with open('dataschools.json', 'w', encoding='latin-1') as f:
    #     json_string = json.dumps(besturen, ensure_ascii=False)
    #     f.write(json_string)
        #print bestuur['naam'], len(bestuur['scholen'])

def parseBevoegdGezag(rows):
    for row in rows:
        yield mapRowBevoegdGezag(row)

def parseScholen(rows):
    personeel = list(parsePersoneel(readCSV('personeel_basisscholen.csv')))
    for row in rows:
        yield mapRowSchool(row, personeel)

def parsePersoneel(rows):
    for row in rows:
        yield mapRowPersoneel(row)

def parseLeerlingen(rows):
    for row in rows:
        yield mapRowLeerling(row)

def parseCitoScores(rows):
    for row in rows:
        yield mapRowCito(row)

def parsePersoneelsKosten(rows):
    for row in rows:
        yield mapRowPK(row)

def parseMI(rows):
    for row in rows:
        yield mapRowMI(row)
def parseWoonplaatsLeerlingen(rows):
    for row in rows:
        yield mapRowWoonplaatsen(row)
def mapRowBevoegdGezag(row):
    result = {}
    result['bg_nr'] = row[0]
    result['naam'] = row[1]

    result['adres'] = {}   
    result['adres']['straat'] = row[2]
    result['adres']['huisnummer'] = row[3]
    result['adres']['postcode'] = row[4]
    result['adres']['plaats'] = row[5]
    result['adres']['gemeente_nr'] = row[6]
    result['adres']['gemeente'] = row[7]

    result['type'] = row[8]
   
    result['contact'] = {}
    result['contact']['telefoon'] = row[9]
    result['contact']['website'] = row[10]

    result['soorten'] = row[16].split(' + ')
    result['scholen'] = []
    result['locatie'] = {}
    number, prefix = getNumberandPrefix(result['adres']['huisnummer'])
    result['adres']['toevoeging'] = prefix
    postcode = result['adres']['postcode'].replace(' ', '')
    r = requests.get('http://boskopu.com:9200/koiri/_search?q=code:'+postcode+'+number:'+number)
    result['locatie']['lat'] = 0
    result['locatie']['lon'] = 0
    if r.status_code == 200:
        data = r.json()
        if data['hits'] and data['hits']['total'] > 0:
            source = data['hits']['hits'][0]['_source']
            if source and source['position']:
                result['locatie']['lat'] = source['position']['lat']
                result['locatie']['lon'] = source['position']['lon'] 
                result['adres']['plaats'] = source['place']     
    return result

def mapRowSchool(row, personeel):

    result = {}
   
    result['bg_nr'] = row[0]
    result['brin_nr'] = row[1]
    result['vest_nr'] = row[2]
    result['naam'] = row[3]
   
    result['adres'] = {}   
    result['adres']['straat'] = row[4]
    result['adres']['huisnummer'] = row[5]
    result['adres']['postcode'] = row[6]
    result['adres']['plaats'] = row[7]
    result['adres']['provincie'] = row[8]
    result['adres']['gemeente_nr'] = row[9]
    result['adres']['gemeente'] = row[10]

    result['type'] = row[11]
   
    result['contact'] = {}
    result['contact']['telefoon'] = row[12]
    result['contact']['website'] = row[13]
    # result['personeel'] = [item for item in personeel if item['bg_nr'] == result['bg_nr'] and item['brin_nr'] == result['brin_nr']]
    
    result['locatie'] = {}
    number, prefix = getNumberandPrefix(result['adres']['huisnummer'])
    result['adres']['huisnummer'] = parseInt(number)
    result['adres']['toevoeging'] = prefix
    postcode = result['adres']['postcode'].replace(' ', '')
    r = requests.get('http://boskopu.com:9200/koiri/_search?q=code:'+postcode+'+number:'+number)
    result['locatie']['lat'] = 0
    result['locatie']['lon'] = 0
    if r.status_code == 200:
        data = r.json()
        if data['hits'] and data['hits']['total'] > 0:
            source = data['hits']['hits'][0]['_source']
            if source and source['position']:
                result['locatie']['lat'] = source['position']['lat']
                result['locatie']['lon'] = source['position']['lon']
                result['adres']['plaats'] = source['place']
    
    return result

def mapRowPersoneel(row):
    result = {}
    result['onderwijstype'] = row[0];
    result['bg_nr'] = row[1];
    result['brin_nr'] = row[2];
    result['functie'] = row[3];
    result['statistieken'] = [];
    aantalen = row[4:9]
    vaste_aantalen = row[9:14]
    tijdelijk_aantalen = row[14:19]
    vrouw_aantalen = row[19:24]
    man_aantalen = row[24:29]
    onbekend_aantalen = row[29:34]
    leeftijd_15 = row[34:39]
    leeftijd_15_25 = row[39:44]
    leeftijd_25_35 = row[44:49]
    leeftijd_35_45 = row[49:54]
    leeftijd_45_55 = row[54:59]
    leeftijd_55_65 = row[59:64]
    leeftijd_65 = row[64:69]
    leeftijd_onbekend = row[69:74]
    leeftijd = row[89:94]
    leeftijd_man = row[99:104]
    leeftijd_vrouw = row[94:99]
    fte_00_05 = row[74:79]
    fte_05_08 = row[79:84]
    fte_08 = row[84:89]
    startjaar = 2011
    for i in range(0, 5):
        item = {}
        item['jaar'] = startjaar + i
        item['aantal'] = parseInt(aantalen[i])
        item['leeftijd'] = parseFloat(leeftijd[i])
        item['leeftijd_man'] = parseFloat(leeftijd_man[i])
        item['leeftijd_vrouw'] = parseFloat(leeftijd_vrouw[i])
        item['vaste_dienst'] = parseInt(vaste_aantalen[i])
        item['tijdelijke_dienst'] = parseInt(tijdelijk_aantalen[i])
        item['vrouw'] = parseInt(vrouw_aantalen[i])
        item['man'] = parseInt(man_aantalen[i])
        item['onbekend'] = parseInt(onbekend_aantalen[i])
        item['leeftijden'] = {}
        item['leeftijden']['0-15'] = parseInt(leeftijd_15[i])
        item['leeftijden']['15-25'] = parseInt(leeftijd_15_25[i])
        item['leeftijden']['25-35'] = parseInt(leeftijd_25_35[i])
        item['leeftijden']['35-45'] = parseInt(leeftijd_35_45[i])
        item['leeftijden']['45-55'] = parseInt(leeftijd_45_55[i])
        item['leeftijden']['55-65'] = parseInt(leeftijd_55_65[i])
        item['leeftijden']['65+'] = parseInt(leeftijd_65[i])
        item['leeftijden']['onbekend'] = parseInt(leeftijd_onbekend[i])
        item['fte'] = {}
        item['fte']['0.0-0.5'] = parseInt(fte_00_05[i])
        item['fte']['0.5-0.8'] = parseInt(fte_05_08[i])
        item['fte']['0.8-1.0'] = parseInt(fte_08[i])
        result['statistieken'].append(item)
    return result

def mapRowLeerling(row):
    result = {}
    result['brin_nr'] = row[0]
    result['bg_nr'] = row[2]
    result['leerlingen'] = {}

    result['leerlingen']['totaal'] = int(row[-1].replace('.', ''))
    result['leerlingen']['leeftijd14'] = int(row[-2].replace('.', ''))
    result['leerlingen']['leeftijd13'] = int(row[-3].replace('.', ''))
    result['leerlingen']['leeftijd12'] = int(row[-4].replace('.', ''))
    result['leerlingen']['leeftijd11'] = int(row[-5].replace('.', ''))
    result['leerlingen']['leeftijd10'] = int(row[-6].replace('.', ''))
    result['leerlingen']['leeftijd9'] = int(row[-7].replace('.', ''))
    result['leerlingen']['leeftijd8'] = int(row[-8].replace('.', ''))
    result['leerlingen']['leeftijd7'] = int(row[-9].replace('.', ''))
    result['leerlingen']['leeftijd6'] = int(row[-10].replace('.', ''))
    result['leerlingen']['leeftijd5'] = int(row[-11].replace('.', ''))
    result['leerlingen']['leeftijd4'] = int(row[-12].replace('.', ''))
    result['leerlingen']['leeftijd3'] = int(row[-13].replace('.', ''))

    return result;

def mapRowCito(row):
    result = {}

    result['brin_nr'] = row[0];
    
    result['samenstelling'] = {}
    result['scores'] = {}

    samenstelling = {}
    samenstelling['jaar'] = int(row[4][0:4])
    samenstelling['Antillen'] = percToFloat(row[41])+percToFloat(row[47])
    samenstelling['Suriname'] = percToFloat(row[51])
    samenstelling['Marokko'] = percToFloat(row[46])
    samenstelling['Turkije'] = percToFloat(row[53])
    samenstelling['Tunesie'] = percToFloat(row[52])
    samenstelling['Kaapverdie'] = percToFloat(row[45])
    samenstelling['OostEuropa'] = percToFloat(row[55])
    samenstelling['ZuidEuropa'] = percToFloat(row[43]) + percToFloat(row[44]) + percToFloat(row[49]) + percToFloat(row[50])
    samenstelling['Overig'] = percToFloat(row[48]) + percToFloat(row[54])
    samenstelling['DeMolukken'] = percToFloat(row[42])
    samenstelling['Nederland'] = 1 - (samenstelling['Antillen']+samenstelling['Suriname']+samenstelling['Marokko']+samenstelling['Turkije']+samenstelling['Tunesie']+samenstelling['ZuidEuropa']+samenstelling['OostEuropa']+samenstelling['Kaapverdie']+samenstelling['Overig']+samenstelling['DeMolukken'])
    result['samenstelling'] = samenstelling

    toets = {}
    toets['naam'] = row[5]
    toets['jaar'] = int(row[4][0:4])
    toets['score'] = {}
    toets['score']['verwacht'] = 0
    if len(row[-3]) > 0: 
        toets['score']['verwacht'] = float(row[-3].replace(',', '.'))
    toets['score']['toegevoegd'] = 0
    if len(row[-2]) > 0: 
        toets['score']['toegevoegd'] = float(row[-2].replace(',', '.'))
    toets['score']['ware'] = 0
    if len(row[-1]) > 0:
        toets['score']['ware'] = float(row[-1].replace(',', '.'))
    result['scores'] = toets

    return result

def mapRowPK(row):
    result = {}
    result['brin_nr'] = row[0]
    result['kosten'] = {}
    result['kosten']['bedrag'] = float(row[1])
    result['kosten']['kostprijs'] = float(row[2])

    return result

def mapRowMI(row):
    result = {}
    result['brin_nr'] = row[0]
    result['gewicht'] = {}
    result['gewicht']['aantal'] = row[1]
    result['gewicht']['eenheid'] = row[1]
    result['kosten'] = {}
    result['kosten']['bedrag'] = float(row[3])
    result['kosten']['kostprijs'] = float(row[4])

    return result

def mapRowWoonplaatsen(row):
    result = {}
    result['brin_nr'] = row[0]
    result['plaats'] = {}
    result['plaats']['leerling'] = row[1]
    result['plaats']['school'] = row[3]
    result['plaats']['aantal'] = parseInt(row[4])

    return result

def percToFloat(str):
    item = str.replace('%', '')
    item = item.replace(',', '.')

    return float(item)/100.0

def strip_punctuation(s):
    return ''.join(c for c in s if c not in string.punctuation)

def parseInt(s):
    if s.isdigit():
        return int(s)
    else:
        return None
def getNumberandPrefix(s):
    number = ''
    prefix = ''
    numberdetails = getNumberDetails(s)
    if len(numberdetails) == 1:
        number = numberdetails[0]
    elif len(numberdetails) == 2:
        number = numberdetails[0]
        if re.match('[A-Za-z]', numberdetails[1]):
            prefix = numberdetails[1]

    return number, prefix

def getNumberDetails(s):
    print(s)
    if '-' in s:
        return s.split('-')
    else:
        return s.split('/')

def parseFloat(s):
    result = re.findall(r"[-+]?\d*\.\d+|[-+]?\d+", s)
    if len(result)>0:
        return float(result[0])
    return None
def readCSV(path, delimeter=';'):
    with open(path,'rU', encoding='latin-1') as file:
        reader = csv.reader(file,delimiter=delimeter);
        i = 0
        for row in reader:
            if i > 0:
                yield row;
            i = i + 1

if __name__ == "__main__":
    main()
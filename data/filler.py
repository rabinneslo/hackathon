import json
from elasticsearch import Elasticsearch

def main():
   es = Elasticsearch()
   scholen = loadJSON('scholen.json')
   leerlingen = loadJSON('leerlingen.json')
   samenstellingen = loadJSON('cito.json')
   for school in scholen:
       huisnummer = ''
       if 'huisnummer' in school['adres'] and '-' in school['adres']['huisnummer']:
           huisnummer = school['adres']['huisnummer'].split('-')[0]
       else:
           huisnummer = school['adres']['huisnummer'].split('/')[0]
   scholen = fillLeerlingen(scholen, leerlingen)
   scholen = fillSamenstellingenScores(scholen, samenstellingen)
   with open('scholen.json', 'w', encoding='latin-1') as f:
        json_string = json.dumps(scholen, ensure_ascii=False)
        f.write(json_string)    

def fillSamenstellingenScores(scholen, samenstellingen):
    for school in scholen:
       result = [samenstelling for samenstelling in samenstellingen if samenstelling['brin_nr']==school['brin_nr']]
       if result and len(result):
           samenstelling = result[0]
           school['samenstelling'] = {}
           school['samenstelling']['surinaams'] = samenstelling['samenstelling']['Suriname']
           school['samenstelling']['antiliaans'] = samenstelling['samenstelling']['Antillen']
           school['samenstelling']['marokaans'] = samenstelling['samenstelling']['Marokko']
           school['samenstelling']['turks'] = samenstelling['samenstelling']['Turkije']
           school['samenstelling']['tunees'] = samenstelling['samenstelling']['Tunesie']
           school['samenstelling']['kaapverdisch'] = samenstelling['samenstelling']['Kaapverdie']
           school['samenstelling']['joegoslaaf'] = samenstelling['samenstelling']['OostEuropa']
           school['samenstelling']['zuideuropees'] = samenstelling['samenstelling']['ZuidEuropa']
           school['samenstelling']['moluks'] = samenstelling['samenstelling']['DeMolukken']
           school['samenstelling']['overig'] = samenstelling['samenstelling']['Overig']
           school['samenstelling']['nederlands'] = samenstelling['samenstelling']['Nederland']
           school['samenstelling']['rest'] = 1 - samenstelling['samenstelling']['Nederland']

           school['score'] = {}
           school['score']['soort'] = samenstelling['scores']['naam']
           school['score']['ware'] = samenstelling['scores']['score']['ware']
           school['score']['verwacht'] = samenstelling['scores']['score']['verwacht']
           school['score']['correctie'] = samenstelling['scores']['score']['toegevoegd']
    return scholen

def fillLeerlingen(scholen, leerlingen):
    for school in scholen:
       result = [leerling for leerling in leerlingen if leerling['brin_nr'] == school['brin_nr']]
       if result and len(result):
           leerling = result[0]
           school['leerlingen'] = leerling['leerlingen']
    return scholen

def loadJSON(path):
    data = None
    with open(path,'rU', encoding='latin-1') as file:
        data = json.load(file, encoding='latin-1')
    return data

if __name__ == "__main__":
    main()
import json
from elasticsearch import Elasticsearch
from geopy.distance import vincenty
from itertools import *
def main():
   es = Elasticsearch()
   scholen = loadJSON('scholen.json')
   woonplaatsen = loadJSON('woonplaatsen.json')
   locatieLeerlingen = loadJSON('leerlinglocaties.json')
   locatieScholen = loadJSON('schoollocaties.json')
#    personeel = loadJSON('personeel.json')
#    leerlingen = loadJSON('leerlingen.json')
#    samenstellingen = loadJSON('cito.json')
#    pks = loadJSON('pk.json')
#    mis = loadJSON('mi.json')
#    for school in scholen:
#        huisnummer = ''
#        if 'huisnummer' in school['adres'] and '-' in school['adres']['huisnummer']:
#            huisnummer = school['adres']['huisnummer'].split('-')[0]
#        else:
#            huisnummer = school['adres']['huisnummer'].split('/')[0]
#    scholen = fillLeerlingen(scholen, leerlingen)
#    scholen = fillSamenstellingenScores(scholen, samenstellingen)
#    scholen = fillKostenenGewichten(scholen,mis,pks)
#    scholen = fillPersoneel(scholen, personeel)
   scholen = fillAfstanden(scholen, woonplaatsen, locatieLeerlingen, locatieScholen)
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


def fillKostenenGewichten(scholen, mis, pks):
    for school in scholen:
       rPk = [pk for pk in pks if pk['brin_nr'] == school['brin_nr']]
       rMIG= [mi for mi in mis if mi['brin_nr'] == school['brin_nr']]
       school['gewicht'] = {}
       school['kosten']  = {}
       school['kosten']['materieel'] = {}
       school['kosten']['personeel'] = {}
       school['kosten']['totaal'] = {}
       school['kosten']['totaal']['bedrag'] = 0
       school['kosten']['totaal']['kostprijs'] = 0
       if rPk and len(rPk):
           pk = rPk[0]
           school['kosten']['personeel'] = pk['kosten']
           school['kosten']['totaal']['bedrag'] = school['kosten']['personeel']['bedrag']
           school['kosten']['totaal']['kostprijs'] = school['kosten']['personeel']['kostprijs']
       if rMIG and len(rMIG):
           mi = rMIG[0]
           school['kosten']['materieel'] = mi['kosten']
           school['gewicht'] = mi['gewicht']
           school['kosten']['totaal']['bedrag'] = school['kosten']['totaal']['bedrag'] + school['kosten']['materieel']['bedrag']
           school['kosten']['totaal']['kostprijs'] = school['kosten']['totaal']['kostprijs'] + school['kosten']['materieel']['kostprijs']
       if school['kosten']['personeel']:
           school['kosten']['personeel']['aandeel'] = school['kosten']['personeel']['bedrag']/school['kosten']['totaal']['bedrag']
       if  school['kosten']['materieel']:
           school['kosten']['materieel']['aandeel'] = school['kosten']['materieel']['bedrag']/school['kosten']['totaal']['bedrag']
    return scholen   

def fillPersoneel(scholen,personeel):
    for school in scholen:   
        rDirectie = [persoon for persoon in personeel if persoon['brin_nr'] == school['brin_nr'] and persoon['functie']=='Directie']
        rDocent = [persoon for persoon in personeel if persoon['brin_nr'] == school['brin_nr'] and persoon['functie']=='Onderwijsgevend personeel'] 
        rOndersteuner = [persoon for persoon in personeel if persoon['brin_nr'] == school['brin_nr'] and persoon['functie']=='Onderwijsondersteunend personeel (OOP/OBP)']
        totaal = 0
        school['personeel'] = {}
        school['personeel']['totaal'] = 0
        school['personeel']['fulltime'] = 0
        school['personeel']['parttime'] = 0
        school['personeel']['leeftijd'] = 0
        school['personeel']['directie'] = {}
        school['personeel']['docenten'] = {}
        school['personeel']['ondersteuners'] = {}
        if len(rDirectie):
            # statistieken 2013 select index 2
            statistiek = rDirectie[0]['statistieken'][2]
            school['personeel']['totaal'] =  school['personeel']['totaal'] + statistiek['aantal']
            school['personeel']['fulltime'] =  school['personeel']['fulltime'] + statistiek['vaste_dienst']
            school['personeel']['parttime'] =  school['personeel']['parttime'] + statistiek['tijdelijke_dienst']
            school['personeel']['directie']['leeftijd'] = statistiek['leeftijd']
            school['personeel']['directie']['aantal'] = statistiek['aantal']
            school['personeel']['directie']['fulltime'] = statistiek['vaste_dienst']
            school['personeel']['directie']['partime'] = statistiek['tijdelijke_dienst']
            school['personeel']['directie']['mannen'] = {}
            school['personeel']['directie']['mannen']['aantal'] = statistiek['man']
            school['personeel']['directie']['mannen']['leeftijd'] = statistiek['leeftijd_man']
            school['personeel']['directie']['vrouwen'] = {}
            school['personeel']['directie']['vrouwen']['aantal'] = statistiek['vrouw']
            school['personeel']['directie']['vrouwen']['leeftijd'] = statistiek['leeftijd_vrouw']
            school['personeel']['directie']['onbekend'] = {}
            school['personeel']['directie']['onbekend']['aantal'] = statistiek['onbekend']
            som = nullableSum(statistiek['man'], statistiek['vrouw'], statistiek['onbekend'])
            if som > 0:
                school['personeel']['directie']['mannen']['percentage'] = statistiek['onbekend']/som
                school['personeel']['directie']['vrouwen']['percentage'] = statistiek['onbekend']/som
                school['personeel']['directie']['onbekend']['percentage'] = statistiek['onbekend']/som
        if len(rDocent):
            statistiek = rDocent[0]['statistieken'][2]
            school['personeel']['totaal'] =  school['personeel']['totaal'] + statistiek['aantal']
            school['personeel']['fulltime'] =  school['personeel']['fulltime'] + statistiek['vaste_dienst']
            school['personeel']['parttime'] =  school['personeel']['parttime'] + statistiek['tijdelijke_dienst']
            school['personeel']['docenten']['leeftijd'] = statistiek['leeftijd']
            school['personeel']['docenten']['aantal'] = statistiek['aantal']
            school['personeel']['docenten']['fulltime'] = statistiek['vaste_dienst']
            school['personeel']['docenten']['partime'] = statistiek['tijdelijke_dienst']
            school['personeel']['docenten']['mannen'] = {}
            school['personeel']['docenten']['mannen']['aantal'] = statistiek['man']
            school['personeel']['docenten']['mannen']['leeftijd'] = statistiek['leeftijd_man']
            school['personeel']['docenten']['vrouwen'] = {}
            school['personeel']['docenten']['vrouwen']['aantal'] = statistiek['vrouw']
            school['personeel']['docenten']['vrouwen']['leeftijd'] = statistiek['leeftijd_vrouw']
            school['personeel']['docenten']['onbekend'] = {}
            school['personeel']['docenten']['onbekend']['aantal'] = statistiek['onbekend']
            som = nullableSum(statistiek['man'], statistiek['vrouw'], statistiek['onbekend'])
            if som > 0:
                school['personeel']['docenten']['mannen']['percentage'] = statistiek['onbekend']/som
                school['personeel']['docenten']['vrouwen']['percentage'] = statistiek['onbekend']/som
                school['personeel']['docenten']['onbekend']['percentage'] = statistiek['onbekend']/som
        if len(rOndersteuner):
            statistiek = rOndersteuner[0]['statistieken'][2]
            school['personeel']['totaal'] =  school['personeel']['totaal'] + statistiek['aantal']
            school['personeel']['fulltime'] =  school['personeel']['fulltime'] + statistiek['vaste_dienst']
            school['personeel']['parttime'] =  school['personeel']['parttime'] + statistiek['tijdelijke_dienst']
            school['personeel']['ondersteuners']['leeftijd'] = statistiek['leeftijd']
            school['personeel']['ondersteuners']['aantal'] = statistiek['aantal']
            school['personeel']['ondersteuners']['fulltime'] = statistiek['vaste_dienst']
            school['personeel']['ondersteuners']['partime'] = statistiek['tijdelijke_dienst']
            school['personeel']['ondersteuners']['mannen'] = {}
            school['personeel']['ondersteuners']['mannen']['aantal'] = statistiek['man']
            school['personeel']['ondersteuners']['mannen']['leeftijd'] = statistiek['leeftijd_man']
            school['personeel']['ondersteuners']['vrouwen'] = {}
            school['personeel']['ondersteuners']['vrouwen']['aantal'] = statistiek['vrouw']
            school['personeel']['ondersteuners']['vrouwen']['leeftijd'] = statistiek['leeftijd_vrouw']
            school['personeel']['ondersteuners']['onbekend'] = {}
            school['personeel']['ondersteuners']['onbekend']['aantal'] = statistiek['onbekend']
            som = nullableSum(statistiek['man'], statistiek['vrouw'], statistiek['onbekend'])
            if som > 0:
                school['personeel']['ondersteuners']['mannen']['percentage'] = statistiek['onbekend']/som
                school['personeel']['ondersteuners']['vrouwen']['percentage'] = statistiek['onbekend']/som
                school['personeel']['ondersteuners']['onbekend']['percentage'] = statistiek['onbekend']/som
        if school['personeel']['totaal'] > 0:
            tel = 1
            leeftijd = 0.0
            if len(school['personeel']['directie'].items()):
                school['personeel']['directie']['percentage'] = school['personeel']['directie']['aantal'] / school['personeel']['totaal']
                if school['personeel']['directie']['leeftijd'] and school['personeel']['directie']['leeftijd'] > 0:
                    tel = tel + 1
                    leeftijd = leeftijd + school['personeel']['directie']['leeftijd']
            if len(school['personeel']['docenten'].items()):
                school['personeel']['docenten']['percentage'] = school['personeel']['docenten']['aantal'] / school['personeel']['totaal']
                if school['personeel']['docenten']['leeftijd'] and school['personeel']['docenten']['leeftijd'] > 0:
                    tel = tel + 1
                    leeftijd = leeftijd + school['personeel']['docenten']['leeftijd']
            if len(school['personeel']['ondersteuners'].items()):
                school['personeel']['ondersteuners']['percentage'] = school['personeel']['ondersteuners']['aantal'] / school['personeel']['totaal']
                if school['personeel']['ondersteuners']['leeftijd'] and school['personeel']['ondersteuners']['leeftijd']:
                    tel = tel + 1
                    leeftijd = leeftijd + school['personeel']['ondersteuners']['leeftijd']
            school['personeel']['leeftijd'] = leeftijd/tel
            
    return scholen

def fillAfstanden(scholen, woonplaatsen, locatieLeerlingen, locatieScholen):
    for school in scholen:
        plekken = [woonplaats for woonplaats in woonplaatsen if woonplaats['brin_nr']==school['brin_nr']]
        afstand = 0.0
        som = 0.0
        if plekken and len(plekken) > 0:
            for plek in plekken:
                leerlingPlaats = next(filter(lambda x: x['code'] ==plek['plaats']['leerling'], locatieLeerlingen), None)
                
                som = som + plek['plaats']['aantal']
                if leerlingPlaats and school['locatie'] and len(school['locatie'].items()) > 0:
                    afstandleerlingen = vincenty((leerlingPlaats['lat'], leerlingPlaats['lon']),(school['locatie']['lat'], school['locatie']['lon']), ellipsoid='GRS-80').meters
                    if afstandleerlingen > 500000:
                        afstandleerlingen = 0
                    afstand = afstand + (afstandleerlingen*plek['plaats']['aantal'])
        
        if som > 0:
            school['afstand'] = afstand/som

    return scholen

def nullableSum(*args):
    som = 0.0
    for item in args:
        if item:
            som = som + item
    return som

def loadJSON(path):
    data = None
    with open(path,'rU', encoding='latin-1') as file:
        data = json.load(file, encoding='latin-1')
    return data

if __name__ == "__main__":
    main()
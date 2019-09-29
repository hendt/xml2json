import {expect} from 'chai';
import 'mocha';
import xml2json from '../src';

describe('xml2json', () => {
    it('Without XML attributes', () => {
        expect(xml2json('<person><name>John Doe</name></person>'))
            .to.deep.equal({"person": {"name": "John Doe"}});
    });

    describe('With XML attributes', () => {
        it('Single attribute', () => {
            expect(xml2json('<person id="1234"><name>John Doe</name></person>'))
                .to.deep.equal({"person": {"id": "1234", "name": "John Doe"}});
        });

        it('Multiple attributes', () => {
            expect(xml2json('<person id="1234" age="30"><name>John Doe</name></person>'))
                .to.deep.equal({"person": {"id": "1234", "age": "30", "name": "John Doe"}});
        });

        it('Multiple attributes - single quote', () => {
            expect(xml2json("<person id='1234' age='30'><name>John Doe</name></person>"))
                .to.deep.equal({"person": {"id": "1234", "age": "30", "name": "John Doe"}});
        });
    });

    describe('Special cases', () => {
        it('Orphan values', () => {
            expect(xml2json('<person id="1234">Something</person>'))
                .to.deep.equal({"person": {"id": "1234", "_@attribute": "Something"}});
        });

        it('Orphan values in nested xml', () => {
            expect(xml2json('<person><name id="123">John Doe</name></person>', {aloneValueName: '@value'}))
                .to.deep.equal({"person": {"name": {"id": "123", "@value": "John Doe"}}});
        });

        it('Orphan values custom name', () => {
            expect(xml2json('<person id="1234">Something</person>', {aloneValueName: '@value'}))
                .to.deep.equal({"person": {"id": "1234", "@value": "Something"}});
        });

        it('Comments', () => {
            expect(xml2json('<name><!-- some comment -->Jane Doe</name>'))
                .to.deep.equal({"name": "Jane Doe"});
        });

        it('Apostrophe', () => {
            expect(xml2json('<song title="I DON\'T CARE"></song>'))
                .to.deep.equal({"song": {"title": "I DON'T CARE"}});
        });

        it('tags with length < 3', () => {
            expect(xml2json('<aa id="too short"><b>TEST</b></aa>'))
                .to.deep.equal({"aa": {"id": "too short", "b": "TEST"}});
        });

        it('with namespace', () => {
            const xml =
                '<?xml version="1.0" encoding="utf-8"?>' +
                '<ns:Person id="0" xmlns:ns="ns">' +
                '  <ns:Schema Version="1.0" />' +
                '</ns:Person>';

            expect(xml2json(xml))
                .to.deep.equal({
                    "ns:Person": {
                        "id": "0",
                        "xmlns:ns": "ns",
                        "ns:Schema": {
                            "Version": "1.0"
                        }
                    }
                }
            );
        });

        it('prevent whitespace', () => {
            expect(xml2json('<person><name> some</name> <inner>Person </inner> </person>'))
                .to.deep.equal({
                "person": {
                    "name": " some",
                    "inner": "Person "
                }
            });
        });
    })
});
import {expect} from 'chai';
import {Twitter} from '../src/routes/twitter';
import removeTextLink = Twitter.removeTextLink;

describe('Twitter', function() {
	describe('tweet text parsing', function() {
		it('should remove urls from tweets', function() {
			const sampleTweetText = 'She’s tough. But she’s worth it https://t.co/iBg7XMQdhL';

			expect(removeTextLink(sampleTweetText)).to.eql('She’s tough. But she’s worth it');
		});

		it('should leave text without links as is', function() {
			const sampleTweetText = 'She’s tough. But she’s worth it';

			expect(removeTextLink(sampleTweetText)).to.eql(sampleTweetText);
		});
	});
});
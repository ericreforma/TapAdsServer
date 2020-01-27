import React, {Component} from 'react';
import {IMAGES, URL} from '../../../config';

export default class CardRatings extends Component {
	render() {
		const {rating} = this.props;

		return (
			<div className="ups-cr-card">
				<div className="ups-cr-client-info">
					<div className="ups-cr-ci-image">
						<img
							src={
								rating.url
								? `${URL.STORAGE_URL}/${rating.url}`
								: IMAGES.galleryIcon
							}
							alt={rating.business_name}
						/>
					</div>

					<div className="ups-cr-ci-wrapper">
						<h4 className="mb-0"><strong>{rating.business_name}</strong></h4>
						<h5 className="text-muted mb-0">{rating.business_nature}</h5>
						<div>
							{Array(5).fill(null).map((star, starIndex) =>
								<img
									key={starIndex}
									className="ups-cr-star-icon"
									src={starIndex < parseInt(rating.rate) ? IMAGES.icons.starActive : IMAGES.icons.starInactive}
								/>
							)}
						</div>
					</div>
				</div>

				<div className="ups-cr-comment-header">
					<div className="ups-cr-ch-horizontal"></div>
					<h5 className="mb-0 text-muted">Comment</h5>
					<div className="ups-cr-ch-horizontal"></div>
				</div>

				<div className="ups-cr-comment-wrapper">
					{rating.comment ? (
						<p className="ups-cr-comment-text">{rating.comment}</p>
					) : (
						<div className="text-center">
							<span><i>--- no comment ---</i></span>
						</div>
					)}
				</div>
			</div>
		)
	}
}
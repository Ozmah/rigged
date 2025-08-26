import { type CSSProperties, useState } from "react";
import { PacmanLoader } from "react-spinners";

const override: CSSProperties = {
	display: "block",
	margin: "0 auto",
	borderColor: "red",
};

/*

React Spinners Available Loaders:
- BarLoader
- BeatLoader
- BounceLoader
- CircleLoader
- ClimbingBoxLoader
- ClipLoader
- ClockLoader
- DotLoader
- FadeLoader
- GridLoader
- HashLoader
- MoonLoader
- PacmanLoader
- PropagateLoader
- PulseLoader
- PuffLoader
- RingLoader
- RiseLoader
- RotateLoader
- ScaleLoader
- SkewLoader
- SquareLoader
- SyncLoader

*/

export function ReactSpinner() {
	const [loading, setLoading] = useState(true);
	const [color, setColor] = useState("#ffffff");

	return (
		<>
			<PacmanLoader
				color={color}
				loading={loading}
				cssOverride={override}
				size={150}
				aria-label="Loading Spinner"
				data-testid="loader"
			/>
		</>
	);
}

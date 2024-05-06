import React from "react";
import { Box } from "@mui/material";
import bg_landing from "../images/bg_landing.jpg";

const Landing = () => {
	return (
		<Box
			sx={{
				backgroundImage: `url(${bg_landing})`,
				backgroundSize: "cover",
				backgroundPosition: "center",
				height: "100vh",
				width: "100vw",
			}}
		>
			{/* <Typography sx={{
                color: colors.greenAccent[400]
            }}>
                This is Landing
            </Typography> */}
		</Box>
	);
};

export default Landing;

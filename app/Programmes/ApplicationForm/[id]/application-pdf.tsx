"use client";

import { bsProgrammes, getLevelByStream, getStreamName, hsProgrammes, hssProgrammes } from "@/assets/data/programmes";
import { Document, Page, Text, StyleSheet, Image, Font, View } from "@react-pdf/renderer";

// ── Register Fonts ──────────────────────────────────────────────────────────
Font.register({
  family: "Poppins",
  fonts: [
    { src: "https://fonts.gstatic.com/s/poppins/v24/pxiEyp8kv8JHgFVrFJDUdVNF.ttf", fontWeight: 400 },
    { src: "https://fonts.gstatic.com/s/poppins/v24/pxiByp8kv8JHgFVrLGT9V1tvEv-L.ttf", fontWeight: 500 },
    { src: "https://fonts.gstatic.com/s/poppins/v24/pxiByp8kv8JHgFVrLEj6V1tvEv-L.ttf", fontWeight: 600 },
    { src: "https://fonts.gstatic.com/s/poppins/v24/pxiByp8kv8JHgFVrLCz7V1tvEv-L.ttf", fontWeight: 700 },
    { src: "https://fonts.gstatic.com/s/poppins/v24/pxiByp8kv8JHgFVrLDD4V1tvEv-L.ttf", fontWeight: 800 },
  ],
});
Font.register({
  family: "Sora",
  fonts: [
    {src: "/fonts/sora-v17-latin-100.ttf",fontWeight: 100,},
    {src: "/fonts/sora-v17-latin-200.ttf",fontWeight: 200,},
    {src: "/fonts/sora-v17-latin-300.ttf",fontWeight: 300,},
    {src: "/fonts/sora-v17-latin-500.ttf",fontWeight: 500,},
    {src: "/fonts/sora-v17-latin-600.ttf",fontWeight: 600,},
    {src: "/fonts/sora-v17-latin-700.ttf",fontWeight: 700,},
    {src: "/fonts/sora-v17-latin-800.ttf",fontWeight: 800,},
  ],
});

// ── StyleSheet ──────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  page: {
    margin: 0,
    padding: 0,
    fontFamily: "Poppins",
    backgroundColor: "#FFFFFF",
  },
  // The Background Image: covers the entire page
  background: {
    position: "absolute",
    top: 0,
    left: 0,
    width: "100%",
    height: "100%",
  },
  // The Content Container: exactly the size of the page, sitting on top
  container: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    padding: 40, // General padding for text safety
    fontFamily:"Sora",
  },
  // Specific styling for the Application Number
  appNumContainer: {
    marginTop: 88, // Adjust these pixels to match your JPG layout precisely
    marginLeft: 300, 
    // letterSpacing:24.5,
    display:"flex",
    flexDirection:"row",
    gap:18,
    

  },
  charContainer:{
    width:20,
    display:"flex",
    alignItems:"center",
    justifyContent:"center",
  },
  appNumText: {
    fontSize: 18,
    fontWeight: 600,
    color: "#1c1c1c",
  },
  appDtContainer: {
    marginTop: 106,
    display:"flex",
    gap:8.3,
    flexDirection:"column", 
    marginLeft:120,
    fontWeight : 500,
    fontSize:11,
    color: "#1c1c1c",

  },

  appDateTextContainer:{
    marginTop: -29,
    display:"flex",
    gap:8.3,
    flexDirection:"column", 
    marginLeft:40,
    fontWeight : 400,
    fontSize:10,
  },
  photoContainer:{
    position:"absolute",
    top:222,
    left:455,
    width:100,
    height:122,
    borderWidth:0.5,
    borderColor:"#1c1c1c",
  },
  photo:{
    width: "100%",
    height: "100%",
    objectFit: "cover",
  },
  qrContainer:{
    position:"absolute",
    top:357,
    left:475,
    width:85,
    height:85,
    borderWidth:0.5,
    borderColor:"#1c1c1c",
    overflow:"hidden",
  },
  qrImage:{
    width: "100%",
    height: "100%",
    objectFit: "cover",
  },
  textContainer:{
    height:20,
    display:"flex",
    justifyContent:"center",
    
  }
});

// ── Main Component ──────────────────────────────────────────────────────────
interface Props {
  data?: any;
}



export const JNETHallTicketPDF = ({ data }: Props) => {
  return (
    <Document
      title="JNET Hall Ticket"
      author="Jamia Madeenathunnoor"
      subject="J-NET 2026 Hall Ticket"
    >
      <Page size="A4" style={styles.page}>
        {/* LAYER 1: BACKGROUND 
            The 'fixed' prop tells react-pdf this component 
            should not shift other elements' positions.
        */}
        <Image 
          src="/images/JNET-Hall-ticket-Template.jpg" 
          style={styles.background} 
          fixed 
        />

        {/* LAYER 2: CONTENT 
            Because this is absolutely positioned, it will 
            stay on Page 1 regardless of the Image above it.
        */}
        <View style={styles.container}>
          <View style={styles.appNumContainer}>
            {data?.applicationNumber.split("").map((char: string, index: number) => (
              <View key={index} style={styles.charContainer}>
                <Text style={styles.appNumText}>
                  {char}
                </Text>
              </View>
            ))}
          </View>

          {/* exam date */}
            <View style={styles.appDateTextContainer}>
             <Text>{getLevelByStream(data.stream) == "8" ? "12/04/2026" : ["HSSCM","HSSHM"].includes(data.stream) ? "25/04/2026" : "15/04/2026"}</Text>
             </View>
          
          {/* Example of adding more info elsewhere on the ticket */}
          <View style={styles.appDtContainer}>
            <View style={styles.textContainer}>
             <Text>{data.name || ""}</Text>
             </View>
             <View style={styles.textContainer}>
             <Text>{data.father_name || ""}</Text>
             </View>
             <View style={styles.textContainer}>
             <Text>{data.dob || ""}</Text>
             </View>
             <View style={styles.textContainer}>
             <Text>{data.whatsapp || ""}</Text>
             </View>
             <View style={styles.textContainer}>
             <Text style={{marginTop:10}}>{getStreamName(data.stream) || ""}</Text>
             </View>
          </View>
          <View style={styles.photoContainer}>
            {data?.photo && data.photo !== "pending" && (
              <Image 
                src={data.photoBase64 || (data.photo.includes("cloudinary.com") ? data.photo.replace("/upload/", "/upload/f_jpg/") : data.photo)} 
                style={styles.photo} 
              />
            )}
          </View>
          <View style={styles.qrContainer}>
            <Image style={styles.qrImage} src={`https://quickchart.io/qr?text=${encodeURIComponent(data?.applicationNumber || 'JN0001')}&size=350`} fixed />
          </View>
        </View>
      </Page>
    </Document>
  );
};

export default JNETHallTicketPDF;
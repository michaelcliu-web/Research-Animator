import useVideoGeneration from "../hooks/useVideoGeneration";
import DashboardView from "../views/Dashboard/DashboardView";
import FeedView from "../views/Feed/FeedView";
import MyVideosView from "../views/MyVideos/MyVideosView";
import SettingsView from "../views/Settings/SettingsView";

/** Shows the view for the sidebar tab the user selected. */
const Content = ({ socket, selectedMode, getToken }) => {
  // Lives here (not in DashboardView) so a run in progress survives switching tabs.
  const generation = useVideoGeneration(socket, getToken);

  switch (selectedMode) {
    case "feed":
      return <FeedView socket={socket} />;
    case "my_videos":
      return <MyVideosView socket={socket} />;
    case "settings":
      return <SettingsView />;
    default:
      return (
        <DashboardView
          stage={generation.stage}
          pdfUrl={generation.pdfUrl}
          streamingText={generation.streamingText}
          result={generation.result}
          uploading={generation.uploading}
          skillLevel={generation.skillLevel}
          onSkillLevelChange={generation.setSkillLevel}
          onFileSelect={generation.startGeneration}
          onReset={generation.reset}
        />
      );
  }
};

export default Content;

import React, { useState, useEffect, useCallback } from 'react';
import { Settings, EmotionMapping, Emotion } from '../types';
import { EMOTIONS, defaultEmotionMappings as EMOTION_MAPPING_DEFAULTS } from '../constants'; // Corrected imports
import Button from './Button';
import Select from './Select';

interface SettingsPanelProps {
  settings: Settings;
  onSettingsChange: (newSettings: Settings) => void;
  emotionMappings: Record<Emotion, EmotionMapping>;
  onEmotionMappingsChange: (newMappings: Record<Emotion, EmotionMapping>) => void;
}

const SettingsPanel: React.FC<SettingsPanelProps> = ({
  settings,
  onSettingsChange,
  emotionMappings,
  onEmotionMappingsChange,
}) => {
  const [availableCameras, setAvailableCameras] = useState<{ id: string; name: string }[]>([]);
  const [tempSettings, setTempSettings] = useState<Settings>(settings);
  const [tempEmotionMappings, setTempEmotionMappings] = useState<Record<Emotion, EmotionMapping>>(emotionMappings);
  const [editingEmotion, setEditingEmotion] = useState<Emotion | null>(null);

  useEffect(() => {
    setTempSettings(settings);
  }, [settings]);

  useEffect(() => {
    setTempEmotionMappings(emotionMappings);
  }, [emotionMappings]);

  useEffect(() => {
    const getCameras = async () => {
      try {
        const devices = await navigator.mediaDevices.enumerateDevices();
        const videoDevices = devices
          .filter(device => device.kind === 'videoinput')
          .map(device => ({
            id: device.deviceId,
            name: device.label || `Camera ${device.deviceId.substring(0, 8)}`,
          }));
        setAvailableCameras(videoDevices);
        if (!settings.selectedCameraId && videoDevices.length > 0) {
          onSettingsChange({ ...settings, selectedCameraId: videoDevices[0].id });
        }
      } catch (err) {
        console.error('Error enumerating devices:', err);
      }
    };
    getCameras();
  }, [settings, onSettingsChange]);

  const handleSettingChange = useCallback((e: React.ChangeEvent<HTMLSelectElement | HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setTempSettings(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  }, []);

  const handleMappingChange = useCallback((emotion: Emotion, field: keyof EmotionMapping, value: string | number | [number, number] | string[]) => {
    setTempEmotionMappings(prev => ({
      ...prev,
      [emotion]: {
        ...prev[emotion],
        [field]: value,
      },
    }));
  }, []);

  const saveSettings = useCallback(() => {
    onSettingsChange(tempSettings);
    onEmotionMappingsChange(tempEmotionMappings);
  }, [onSettingsChange, tempSettings, onEmotionMappingsChange, tempEmotionMappings]);

  const resetToDefaults = useCallback(() => {
    onSettingsChange({
      selectedCameraId: availableCameras[0]?.id || '', // Reset to first available camera
      spotifyDiscoveryMode: true,
      geminiModel: 'gemini-3-pro-image-preview',
    });
    onEmotionMappingsChange(EMOTIONS.reduce((acc, emo) => {
      acc[emo] = { ...EMOTION_MAPPING_DEFAULTS[emo] }; // Deep copy defaults from constants
      return acc;
    }, {} as Record<Emotion, EmotionMapping>));
  }, [onSettingsChange, onEmotionMappingsChange, availableCameras]);

  return (
    <div className="p-4 space-y-6">
      <div className="settings-section bg-gray-700 p-4 rounded-lg">
        <h3 className="text-xl font-semibold mb-3 text-white">General Settings</h3>

        <div className="mb-4">
          <label htmlFor="camera-select" className="block text-gray-300 text-sm font-bold mb-2">
            Select Camera:
          </label>
          <Select
            id="camera-select"
            name="selectedCameraId"
            value={tempSettings.selectedCameraId}
            onChange={handleSettingChange}
            options={availableCameras.map(camera => ({ value: camera.id, label: camera.name }))}
            className="w-full"
          />
        </div>

        <div className="mb-4">
          <label htmlFor="gemini-model" className="block text-gray-300 text-sm font-bold mb-2">
            Gemini Model (for Emotion Detection):
          </label>
          <Select
            id="gemini-model"
            name="geminiModel"
            value={tempSettings.geminiModel}
            onChange={handleSettingChange}
            options={[
              { value: 'gemini-3-pro-image-preview', label: 'Gemini 3 Pro (Image)' },
              { value: 'gemini-2.5-flash-image', label: 'Gemini 2.5 Flash (Image)' },
            ]}
            className="w-full"
          />
          <p className="text-xs text-gray-400 mt-1">
            Using higher quality models like Gemini 3 Pro may incur higher costs and latency.
          </p>
        </div>

        <div className="flex items-center mb-4">
          <input
            type="checkbox"
            id="spotifyDiscoveryMode"
            name="spotifyDiscoveryMode"
            checked={tempSettings.spotifyDiscoveryMode}
            onChange={handleSettingChange}
            className="form-checkbox h-5 w-5 text-blue-600 rounded"
          />
          <label htmlFor="spotifyDiscoveryMode" className="ml-2 text-gray-300">
            Spotify Discovery Mode (recommend new music)
          </label>
          <p className="text-xs text-gray-400 ml-2">
            (Uncheck for Comfort Mode: recommend familiar genres/artists)
          </p>
        </div>
      </div>

      <div className="settings-section bg-gray-700 p-4 rounded-lg">
        <h3 className="text-xl font-semibold mb-3 text-white">Emotion-Music Mappings</h3>
        <p className="text-gray-300 text-sm mb-4">
          Customize how each emotion translates to music characteristics.
          These values influence Spotify recommendations.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {EMOTIONS.map(emotion => (
            <div key={emotion} className="bg-gray-800 p-4 rounded-lg">
              <div className="flex justify-between items-center mb-2">
                <h4 className="text-lg font-medium text-blue-300">{emotion}</h4>
                <Button
                  onClick={() => setEditingEmotion(editingEmotion === emotion ? null : emotion)}
                  variant="secondary"
                  className="px-2 py-1 text-xs"
                >
                  {editingEmotion === emotion ? 'Close' : 'Edit'}
                </Button>
              </div>

              {editingEmotion === emotion && (
                <div className="space-y-3 mt-3">
                  <div>
                    <label className="block text-gray-400 text-sm">Valence Range (0.0-1.0)</label>
                    <div className="flex gap-2">
                      <input
                        type="number"
                        step="0.1"
                        min="0"
                        max="1"
                        value={tempEmotionMappings[emotion].valenceRange[0]}
                        onChange={(e) => handleMappingChange(emotion, 'valenceRange', [parseFloat(e.target.value), tempEmotionMappings[emotion].valenceRange[1]])}
                        className="w-1/2 p-2 bg-gray-900 rounded-md text-white"
                      />
                      <input
                        type="number"
                        step="0.1"
                        min="0"
                        max="1"
                        value={tempEmotionMappings[emotion].valenceRange[1]}
                        onChange={(e) => handleMappingChange(emotion, 'valenceRange', [tempEmotionMappings[emotion].valenceRange[0], parseFloat(e.target.value)])}
                        className="w-1/2 p-2 bg-gray-900 rounded-md text-white"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-gray-400 text-sm">Energy Range (0.0-1.0)</label>
                    <div className="flex gap-2">
                      <input
                        type="number"
                        step="0.1"
                        min="0"
                        max="1"
                        value={tempEmotionMappings[emotion].energyRange[0]}
                        onChange={(e) => handleMappingChange(emotion, 'energyRange', [parseFloat(e.target.value), tempEmotionMappings[emotion].energyRange[1]])}
                        className="w-1/2 p-2 bg-gray-900 rounded-md text-white"
                      />
                      <input
                        type="number"
                        step="0.1"
                        min="0"
                        max="1"
                        value={tempEmotionMappings[emotion].energyRange[1]}
                        onChange={(e) => handleMappingChange(emotion, 'energyRange', [tempEmotionMappings[emotion].energyRange[0], parseFloat(e.target.value)])}
                        className="w-1/2 p-2 bg-gray-900 rounded-md text-white"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-gray-400 text-sm">Tempo (BPM)</label>
                    <div className="flex gap-2">
                      <input
                        type="number"
                        step="1"
                        min="0"
                        value={tempEmotionMappings[emotion].tempo[0]}
                        onChange={(e) => handleMappingChange(emotion, 'tempo', [parseInt(e.target.value), tempEmotionMappings[emotion].tempo[1]])}
                        className="w-1/2 p-2 bg-gray-900 rounded-md text-white"
                      />
                      <input
                        type="number"
                        step="1"
                        min="0"
                        value={tempEmotionMappings[emotion].tempo[1]}
                        onChange={(e) => handleMappingChange(emotion, 'tempo', [tempEmotionMappings[emotion].tempo[0], parseInt(e.target.value)])}
                        className="w-1/2 p-2 bg-gray-900 rounded-md text-white"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-gray-400 text-sm">Key</label>
                    <input
                      type="text"
                      value={tempEmotionMappings[emotion].key}
                      onChange={(e) => handleMappingChange(emotion, 'key', e.target.value)}
                      className="w-full p-2 bg-gray-900 rounded-md text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-gray-400 text-sm">Genres (comma-separated)</label>
                    <input
                      type="text"
                      value={tempEmotionMappings[emotion].genres.join(', ')}
                      onChange={(e) => handleMappingChange(emotion, 'genres', e.target.value.split(',').map(g => g.trim()).filter(Boolean))}
                      className="w-full p-2 bg-gray-900 rounded-md text-white"
                    />
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      <div className="flex justify-end gap-3 pt-4 border-t border-gray-600">
        <Button onClick={resetToDefaults} variant="danger">
          Reset to Defaults
        </Button>
        <Button onClick={saveSettings} variant="primary">
          Save Settings
        </Button>
      </div>
    </div>
  );
};

export default SettingsPanel;
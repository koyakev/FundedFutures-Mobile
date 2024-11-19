import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, FlatList, Pressable, Alert, ActivityIndicator } from 'react-native';
import { doc, getDoc, getDocs, addDoc, collection, query, where, updateDoc } from 'firebase/firestore';
import { ref, uploadBytes } from 'firebase/storage';
import { db, storage } from '../firebase/dbConnection';
import AntDesign from '@expo/vector-icons/AntDesign';
import * as DocumentPicker from 'expo-document-picker';

const Application = ({ navigation, route }) => {
    const { id } = route.params;
    const { offerId } = route.params;
    const [user, setUser] = useState(null);
    const [offer, setOffer] = useState(null);
    const [documents, setDocuments] = useState([]);
    const [uploading, setUploading] = useState(false);

    useEffect(() => {
        const fetchOffer = async () => {
            try {
                const userDoc = await getDoc(doc(db, 'students', id));
                setUser(userDoc.data());

                const offerDoc = await getDoc(doc(db, 'scholarships', offerId));
                setOffer(offerDoc.data());
            } catch (error) {
                console.error('Error fetching documents: ', error);
            }
        }

        fetchOffer();
    }, []);
    const pickDocument = async () => {
        try {
            let result = await DocumentPicker.getDocumentAsync({
                type: '*/*',
                copyToCacheDirectory: true,
                multiple: true,
            });

            console.log('Document picker result: ', result);
            setDocuments([...documents, ...result.assets.map(doc => doc.uri)]);
        } catch (error) {
            console.error('Error picking document: ', error);
        }
    }

    const uploadMedia = async () => {
        if (documents.length === 0) {
            Alert.alert('No documents selected', 'Please select some documents first.');
            return;
        }

        setUploading(true);

        try {
            const querySnap = await getDocs(query(collection(db, 'enrollments'), where('userId', '==', id), where('offerId', '==', offerId)));

            if (querySnap.empty) {
                for (const document of documents) {
                    const blob = await new Promise((resolve, reject) => {
                        const xhr = new XMLHttpRequest();
                        xhr.onload = () => resolve(xhr.response);;
                        xhr.onerror = () => reject(new TypeError('Network request failed'));
                        xhr.responseType = 'blob';
                        xhr.open('GET', document, true);
                        xhr.send(null);
                    });

                    const filename = document.substring(document.lastIndexOf('/') + 1);
                    const storageRef = ref(storage, `${id}/${offerId}/` + filename);

                    await uploadBytes(storageRef, blob);

                    blob.close();

                }

                await addDoc(collection(db, 'logs'), {
                    activity: `Enrolled to ${offer.programName}`,
                    userId: id,
                    timestamp: new Date(),
                })

                await addDoc(collection(db, 'enrollments'), {
                    userId: id,
                    offerId: offerId,
                    status: 'Pending',
                    dateApplied: new Date().toLocaleDateString()
                });

                await updateDoc(doc(db, 'scholarships', offerId), {
                    applied: (offer.applied + 1)
                });

                await updateDoc(doc(db, 'students', id), {
                    applications: user.applications + 1,
                })

                navigation.navigate('Profile', { id: id });
                setUploading(false);
                Alert.alert('Documents Uploaded');
                setDocuments([]);
            } else {
                Alert.alert('Invalid Application');
                navigation.navigate('Profile', { id: id });
            }


        } catch (error) {
            console.error(error);
            setUploading(false);
        }
    };

    return (
        <View style={styles.container}>

            <Pressable
                onPress={() => navigation.goBack()}
            >
                <AntDesign name="arrowleft" size={40} color="#F7D66A" />
            </Pressable>

            {offer && (
                <View style={styles.form}>
                    <View style={styles.programTitle}>
                        <Text style={styles.programName}>{offer.programName}</Text>
                    </View>
                    <Text>Requirements: </Text>
                    <FlatList
                        data={offer.requirements}
                        keyExtractor={(item, index) => index.toString()}
                        renderItem={({ item }) => (
                            <Text style={styles.programRequirement}>• {item}</Text>
                        )}
                    />

                    <TouchableOpacity
                        style={styles.upload}
                        onPress={pickDocument}
                    >
                        <Text style={styles.uploadText}>Pick Documents</Text>
                    </TouchableOpacity>

                    {documents.length > 0 && (
                        <View>
                            <FlatList
                                data={documents}
                                keyExtractor={(item, index) => index.toString()}
                                renderItem={({ item, index }) => (
                                    <View style={styles.documents}>
                                        <Text style={styles.document}>• {item.substring(item.lastIndexOf('/') + 1)}</Text>
                                    </View>
                                )}
                            />

                            {!uploading ? (
                                <TouchableOpacity
                                    style={styles.upload}
                                    onPress={uploadMedia}
                                >
                                    <Text style={styles.uploadText}>Upload Documents</Text>
                                </TouchableOpacity>
                            ) : (
                                <View style={styles.upload}>
                                    <ActivityIndicator
                                        size="small"
                                        color="#F7D66A"
                                    />
                                </View>
                            )}
                        </View>
                    )}

                </View>
            )}
        </View>
    );
}

export default Application;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#4D4D4D',
        padding: 20
    },
    form: {
        padding: 20,
        marginTop: 20,
        backgroundColor: '#F7D66A',
        borderRadius: 20
    },
    programTitle: {
        alignItems: 'center',
        borderBottomWidth: 1,
        borderBottomColor: '#4D4D4D',
        marginBottom: 20
    },
    programName: {
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: 10
    },
    programRequirement: {
        fontSize: 17
    },
    upload: {
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 20,
        padding: 12,
        borderRadius: 20,
        backgroundColor: '#333333',

    },
    uploadText: {
        color: '#F7D66A',
        fontSize: 14,
        fontWeight: 'bold'
    },
    documents: {
        flex: 1,
        marginTop: 10,
        backgroundColor: '#4D4D4D',
        padding: 12,
        borderRadius: 20
    },
    document: {
        color: '#F7D66A'
    }
})